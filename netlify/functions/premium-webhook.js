// netlify/functions/premium-webhook.js
// Suporta: Stripe (verifica assinatura) + Kiwify (fallback original).
// Atualizado para tratar checkout.session.completed, invoice.payment_succeeded, subscription events, e fallback Kiwify.
// Copie/cole direto e faça deploy.

// 🔧 Necessário para Stripe signature funcionar no Netlify
exports.config = {
  event: {
    body: {
      raw: true,
    },
  },
};


exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Helpers
  const safeJson = (v) => {
    try { return JSON.parse(v); } catch (e) { return v; }
  };

  const initSupabase = () => {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { 'Authorization': `Bearer ${supabaseServiceKey}` } }
    });
    return { supabase, supabaseUrl, supabaseServiceKey };
  };

  const findUserIdByEmail = async (supabase, email) => {
    try {
      const { data: directResult, error: directError } = await supabase
        .from('users')
        .select('id, email, name, is_premium, premium_expires_at')
        .eq('email', email)
        .maybeSingle();

      if (directError) {
        console.log('Direct query error (findUserIdByEmail):', directError.message || directError);
      }
      if (directResult && directResult.id) return directResult.id;

      // Fallback RPC if available (same approach used no seu webhook anterior)
      try {
        const { data: rpcResult, error: rpcError } = await supabase
          .rpc('find_user_by_email_for_webhook', { email_param: email });

        if (rpcError) {
          console.log('RPC fallback error:', rpcError);
        } else if (rpcResult && rpcResult.length > 0) {
          return rpcResult[0].id;
        }
      } catch (rpcExc) {
        console.log('RPC fallback exception:', rpcExc.message || rpcExc);
      }
    } catch (err) {
      console.error('Error finding user by email:', err);
    }
    return null;
  };

  const activatePremiumForUser = async (supabase, userId, expiresAtISO, extras = {}) => {
    try {
      const updatePayload = {
        is_premium: true,
        premium_expires_at: expiresAtISO,
        daily_message_count: 0,
        updated_at: new Date().toISOString(),
        ...extras
      };
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', userId)
        .select('id, email, name, is_premium, premium_expires_at');

      if (updateError) throw updateError;
      if (!updatedUser || updatedUser.length === 0) {
        // could be because row already had same values; we'll still treat as success but log
        console.warn('No rows returned on update (maybe no changes), checking existence...');
        const { data: checkUser } = await supabase
          .from('users')
          .select('id, email, name, is_premium, premium_expires_at')
          .eq('id', userId);
        return { ok: true, updated: updatedUser, check: checkUser };
      }

      return { ok: true, updated: updatedUser };
    } catch (err) {
      console.error('Error activating premium for user:', err);
      return { ok: false, error: err };
    }
  };

  const createSubscriptionRecord = async (supabase, payload) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(payload)
        .select();
      if (error) {
        console.log('Could not create subscription record:', error.message || error);
        return { ok: false, error };
      }
      return { ok: true, data };
    } catch (err) {
      console.log('Exception creating subscription record:', err.message || err);
      return { ok: false, error: err };
    }
  };

  try {
    console.log('=== WEBHOOK INICIADO ===');
    // Headers lowercased in Netlify sometimes; let's make a case-insens map
    const rawHeaders = {};
    for (const key in event.headers || {}) {
      rawHeaders[key.toLowerCase()] = event.headers[key];
    }

    // Detect Stripe webhook by presence of signature header
    const stripeSigHeader = rawHeaders['stripe-signature'] || rawHeaders['stripe_signature'];
    const hasStripe = !!stripeSigHeader && !!process.env.STRIPE_WEBHOOK_SECRET && !!process.env.STRIPE_SECRET_KEY;

    if (hasStripe) {
      console.log('⚡ Processing Stripe webhook...');
      // require stripe only when needed
      const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // raw body required for signature verification
      let rawBody = event.body;
      if (event.isBase64Encoded) {
        rawBody = Buffer.from(event.body, 'base64');
      } else if (typeof event.body !== 'string') {
        // Best-effort fallback; this may fail signature verification.
        rawBody = JSON.stringify(event.body);
      }

      let stripeEvent;
      try {
        stripeEvent = Stripe.webhooks.constructEvent(rawBody, stripeSigHeader, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (sigErr) {
        console.error('❌ Stripe signature verification failed:', sigErr.message);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Stripe signature verification failed', details: sigErr.message })
        };
      }

      console.log('Stripe event type:', stripeEvent.type);

      // Initialize supabase client only if needed
      let supabaseClientObj = null;
      const ensureSupabase = () => {
        if (!supabaseClientObj) supabaseClientObj = initSupabase();
        return supabaseClientObj;
      };

      // Helper to resolve targetUserId from multiple sources
      const resolveTargetUserId = async ({ providedUserId, email, metadata }) => {
        if (providedUserId) return providedUserId;
        // check metadata for user_id or client_reference_id
        if (metadata) {
          if (metadata.user_id) return metadata.user_id;
          if (metadata.client_reference_id) return metadata.client_reference_id;
        }
        if (email) {
          // find by email via supabase
          const { supabase } = ensureSupabase();
          const found = await findUserIdByEmail(supabase, email);
          if (found) return found;
        }
        return null;
      };

      // For readability pull type & object
      const evType = stripeEvent.type;
      const obj = stripeEvent.data.object || {};

      // We'll compute these to use common update logic:
      let targetUserId = null;
      let userEmail = null;
      let subscriptionId = null;
      let expiresAtISO = null;
      let amount = null;
      let currency = null;

      // ---- HANDLE event types ----
      if (evType === 'checkout.session.completed') {
        // When using Stripe Checkout for subscriptions, session.subscription contains subscription id
        const session = obj;
        console.log('Checkout session object:', {
          id: session.id,
          client_reference_id: session.client_reference_id,
          customer: session.customer,
          customer_email: session.customer_email,
          subscription: session.subscription,
          metadata: session.metadata
        });

        subscriptionId = session.subscription || null;
        userEmail = (session.customer_details && session.customer_details.email) || session.customer_email || session.metadata?.email || null;
        // prefer client_reference_id (we set it to userId in PremiumUpsellModal)
        const providedUserId = session.client_reference_id || session.metadata?.user_id || session.metadata?.client_reference_id || null;

        // If we have subscription id, try to retrieve subscription to find period_end
        if (subscriptionId) {
          try {
            const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            const subscription = await Stripe.subscriptions.retrieve(subscriptionId);
            if (subscription && subscription.current_period_end) {
              expiresAtISO = new Date(subscription.current_period_end * 1000).toISOString();
            }
            // attempt get price/amount/currency
            const firstItem = subscription?.items?.data?.[0];
            amount = firstItem?.price?.unit_amount ? (firstItem.price.unit_amount / 100) : null;
            currency = firstItem?.price?.currency || subscription?.currency || session.currency || null;
          } catch (err) {
            console.log('Could not retrieve subscription from Stripe:', err.message || err);
          }
        } else {
          // one-off payment or subscription not yet attached: fallback 30 days
          const fallback = new Date(); fallback.setDate(fallback.getDate() + 30);
          expiresAtISO = fallback.toISOString();
          amount = session.amount_total ? (session.amount_total / 100) : null;
          currency = session.currency || null;
        }

        // resolve user id
        targetUserId = await resolveTargetUserId({ providedUserId, email: userEmail, metadata: session.metadata });

        if (!targetUserId) {
          console.error('❌ Stripe checkout: Could not resolve user id for email/user_ref:', userEmail, providedUserId);
          // Option: return 200 to avoid retries, but signal failure
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'User not found for Stripe checkout', email: userEmail, client_reference_id: providedUserId })
          };
        }

        // Activate premium in Supabase
        const { supabase } = ensureSupabase();
        const expires = expiresAtISO || (() => { const d=new Date(); d.setDate(d.getDate()+30); return d.toISOString(); })();
        const activateResult = await activatePremiumForUser(supabase, targetUserId, expires, { stripe_subscription_id: subscriptionId });
        if (!activateResult.ok) {
          console.error('❌ Failed to activate premium (Stripe checkout):', activateResult.error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to activate premium', details: activateResult.error?.message || activateResult.error })
          };
        }

        // Create subscription record (optional)
        try {
          await createSubscriptionRecord(supabase, {
            user_id: targetUserId,
            status: 'active',
            plan_type: 'premium',
            amount: amount || 0,
            currency: currency || 'USD',
            started_at: new Date().toISOString(),
            expires_at: expires,
            payment_provider: 'stripe',
            external_subscription_id: subscriptionId
          });
        } catch (e) {
          console.log('Subscription record creation for Stripe failed:', e.message || e);
        }

        console.log('✅ Stripe checkout processed, premium activated for user:', targetUserId);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Stripe checkout processed', user_id: targetUserId, expires_at: expires }) };
      }

      // invoice.payment_succeeded or invoice.paid => recurring payment succeeded (extend expiration)
      if (evType === 'invoice.payment_succeeded' || evType === 'invoice.paid') {

        const invoice = obj;
        console.log('Invoice event:', { id: invoice.id, subscription: invoice.subscription, billing_reason: invoice.billing_reason });
        subscriptionId = invoice.subscription || null;
        amount = (invoice.amount_paid != null) ? (invoice.amount_paid / 100) : null;
        currency = invoice.currency || null;
        userEmail = invoice.customer_email || null;

        // retrieve subscription to get current_period_end (if available)
        if (subscriptionId) {
          try {
            const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            const subscription = await Stripe.subscriptions.retrieve(subscriptionId);
            if (subscription && subscription.current_period_end) {
              expiresAtISO = new Date(subscription.current_period_end * 1000).toISOString();
            }
            // try to find metadata user id
            const providedUserId = subscription?.metadata?.user_id || subscription?.metadata?.client_reference_id || null;
            targetUserId = await resolveTargetUserId({ providedUserId, email: userEmail, metadata: subscription?.metadata });
          } catch (err) {
            console.log('Failed retrieving subscription for invoice:', err.message || err);
          }
        } else {
          // no subscription id — fallback
          targetUserId = await resolveTargetUserId({ providedUserId: null, email: userEmail, metadata: invoice?.metadata });
          const fallback = new Date(); fallback.setDate(fallback.getDate() + 30);
          expiresAtISO = fallback.toISOString();
        }

        if (!targetUserId) {
          console.error('❌ Invoice: user not found:', userEmail);
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'User not found (invoice)', email: userEmail }) };
        }

        const { supabase } = ensureSupabase();
        const expires = expiresAtISO || (() => { const d=new Date(); d.setMonth(d.getMonth()+1); return d.toISOString(); })();
        const activateResult = await activatePremiumForUser(supabase, targetUserId, expires, { stripe_subscription_id: subscriptionId });
        if (!activateResult.ok) {
          console.error('❌ Failed to update premium after invoice:', activateResult.error);
          return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to update premium after invoice' }) };
        }

        // create subscription record entry (optional)
        await createSubscriptionRecord(supabase, {
          user_id: targetUserId,
          status: 'active',
          plan_type: 'premium',
          amount: amount || 0,
          currency: currency || 'USD',
          started_at: new Date().toISOString(),
          expires_at: expires,
          payment_provider: 'stripe',
          external_subscription_id: subscriptionId
        });

        console.log('✅ Invoice processed and premium extended for user:', targetUserId);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Invoice processed', user_id: targetUserId, expires_at: expires }) };
      }

      // subscription cancel / deleted => revoke premium
      if (evType === 'customer.subscription.deleted' || evType === 'invoice.payment_failed' || evType === 'charge.refunded') {
        const subscription = obj;
        const subId = subscription.id || subscription.subscription || null;
        console.log('Subscription cancelled/refund event:', evType, subId);
        // attempt to find user by subscription metadata or customer email
        const providedUserId = subscription?.metadata?.user_id || null;
        const email = subscription?.customer_email || null;
        targetUserId = await resolveTargetUserId({ providedUserId, email, metadata: subscription?.metadata });

        if (!targetUserId) {
          console.log('Could not find user to cancel premium for subscription:', subId, 'email:', email);
          return { statusCode: 200, headers, body: JSON.stringify({ message: 'No user to cancel (ok)', subscription: subId }) };
        }

        const { supabase } = ensureSupabase();
        // Set is_premium false and expires_at to now
        const nowIso = new Date().toISOString();
        const { data: updated, error: updErr } = await supabase
          .from('users')
          .update({ is_premium: false, premium_expires_at: nowIso, updated_at: nowIso })
          .eq('id', targetUserId)
          .select('id');

        if (updErr) {
          console.error('Failed to revoke premium:', updErr);
          return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to revoke premium', details: updErr }) };
        }
        console.log('✅ Premium revoked for user:', targetUserId);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Premium revoked', user_id: targetUserId }) };
      }

      // Unhandled Stripe event -> return 200
      console.log('Unhandled Stripe event type (ignored):', evType);
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Unhandled stripe event', type: evType }) };
    } // end Stripe block

    // ---- Fallback: Kiwify (ou outros webhooks JSON sem assinatura) ----
    console.log('⚙️ Processing non-Stripe webhook (Kiwify fallback)...');
    const webhookData = safeJson(event.body);
    console.log('Webhook data parsed:', webhookData);

    // (A partir daqui é o mesmo fluxo que você já tinha)
    const status = webhookData.order_status || webhookData.status;
    const userEmail = webhookData.Customer?.email || webhookData.customer_email;
    const userName = webhookData.Customer?.full_name || webhookData.Customer?.first_name || webhookData.customer_name;
    let userId = webhookData.custom_fields?.user_id || webhookData.metadata?.user_id;
    if (!userId && webhookData.TrackingParameters) {
      userId = webhookData.TrackingParameters.s1 || webhookData.TrackingParameters.s2 || webhookData.TrackingParameters.s3 || webhookData.TrackingParameters.utm_content;
    }
    const subscriptionId = webhookData.subscription_id || webhookData.order_id;

    console.log('Extracted data (kiwify):', { status, userEmail, userName, userId, subscriptionId });

    if (status === 'paid' || status === 'completed' || status === 'approved') {
      // init supabase
      const { supabase } = initSupabase();

      // resolve targetUserId
      let targetUserId = userId;
      if (!targetUserId && userEmail) {
        console.log('🔍 Looking for user by email (Kiwify):', userEmail);
        const found = await findUserIdByEmail(supabase, userEmail);
        if (found) targetUserId = found;
      }

      if (!targetUserId) {
        console.error('❌ Could not find user with email (Kiwify):', userEmail);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'User not found (kiwify)',
            details: { email: userEmail, name: userName }
          })
        };
      }

      // Activate premium for 30 days (same as original)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      const expiresIso = expiresAt.toISOString();

      try {
        const result = await activatePremiumForUser(supabase, targetUserId, expiresIso, { payment_provider: 'kiwify', external_subscription_id: subscriptionId });
        if (!result.ok) throw result.error;
        // create subscription record (optional)
        await createSubscriptionRecord(supabase, {
          user_id: targetUserId,
          status: 'active',
          plan_type: 'premium',
          amount: 29.00,
          currency: 'BRL',
          started_at: new Date().toISOString(),
          expires_at: expiresIso,
          payment_provider: 'kiwify',
          external_subscription_id: subscriptionId
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'Premium (kiwify) activated successfully',
            user_id: targetUserId,
            expires_at: expiresIso
          })
        };
      } catch (err) {
        console.error('❌ Error activating premium (kiwify):', err);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to activate premium (kiwify)', details: err.message || err })
        };
      }
    }

    // Other non-Stripe statuses: return OK
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Webhook processed (no payment action required)',
        status: safeJson(event.body)?.status || null
      })
    };

  } catch (error) {
    console.error('❌ Webhook error (main catch):', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message || error
      })
    };
  }
};
