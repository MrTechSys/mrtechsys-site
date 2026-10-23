// scripts/tolCoreClient.mjs
/**
 * TolCoreClient SDK Adapter for mrtechsys-site
 * Connects to local or remote TOL-Core kernel (:4000)
 */

const TOL_CORE_URL = process.env.TOL_CORE_URL || 'http://localhost:4000';
const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || 'org_engineering';

export class TolCoreClient {
  constructor(baseUrl = TOL_CORE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Check if TOL-Core kernel is reachable.
   * @returns {Promise<boolean>}
   */
  async isHealthy() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Executes a deterministic plan through TOL-Core kernel.
   * @param {Object} params
   * @param {Object} params.plan - ExecutionPlan { id, steps, entrypoint }
   * @param {Array} [params.context] - Array of ContextPointerInput items
   * @param {Object} [params.modelConfig] - { freeOnly, capabilities, allowPaid }
   * @param {string} [params.tenantId] - Target tenant namespace (default: 'org_engineering')
   * @returns {Promise<Object>} TolCoreResponse
   */
  async runPlan({ plan, context = [], modelConfig = { freeOnly: true }, tenantId = DEFAULT_ORG_ID, dryRun = false }) {
    const payload = {
      plan,
      context,
      modelConfig,
      runtimeConfig: { dryRun },
      tenant: { id: tenantId, role: 'service' }
    };

    const response = await fetch(`${this.baseUrl}/tol/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TOL-Org-Id': tenantId,
        'X-TOL-Role': 'service'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`TOL-Core execution failed (${response.status}): ${err.error?.message || err.message || err.error || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Triggers a CloudFlip workflow or CI job by ID.
   */
  async triggerJob(jobId, { tenantId = DEFAULT_ORG_ID, triggeredBy = 'mrtechsys/session-manager', runtimeParams = {} } = {}) {
    const response = await fetch(`${this.baseUrl}/api/jobs/trigger/${jobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TOL-Org-Id': tenantId,
        'X-TOL-Role': 'service'
      },
      body: JSON.stringify({ triggeredBy, runtimeParams })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`TOL-Core job trigger failed (${response.status}): ${err.error || 'Unknown error'}`);
    }

    return response.json();
  }
}

export const tolCore = new TolCoreClient();
