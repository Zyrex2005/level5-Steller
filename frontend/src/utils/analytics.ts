export interface AnalyticsEvent {
  event: 'page_view' | 'wallet_connect' | 'job_created' | 'job_funded' | 'dispute_raised' | 'rating_submitted' | 'first_transaction' | 'repeat_transaction';
  walletAddress?: string;
  metadata?: Record<string, any>;
}

class AnalyticsTracker {
  private hasTransacted: boolean = false;

  public track(event: AnalyticsEvent['event'], walletAddress?: string, metadata?: Record<string, any>) {
    const payload = {
      event,
      walletAddress,
      metadata,
      timestamp: new Date().toISOString()
    };

    console.log('[Analytics Event]', payload);

    // Call backend endpoint silently
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.warn('[Analytics API failed]', err));
  }

  public recordTransaction(walletAddress: string, actionName: string) {
    if (!this.hasTransacted) {
      this.hasTransacted = true;
      this.track('first_transaction', walletAddress, { action: actionName });
    } else {
      this.track('repeat_transaction', walletAddress, { action: actionName });
    }
  }
}

export const analytics = new AnalyticsTracker();
