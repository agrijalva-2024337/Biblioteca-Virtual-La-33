import { CpuChipIcon } from '@heroicons/react/24/outline';
import { Card } from '../../../shared/components/ui/Card.jsx';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import {
  AI_CLASSIFICATION_CONFIG,
  confidenceLabel,
  humanizeAiReason,
} from '../utils/moderationHelpers.js';

export const AiAnalysisSection = ({ moderation }) => {
  if (!moderation?.aiClassification) return null;

  const config =
    AI_CLASSIFICATION_CONFIG[moderation.aiClassification] || {
      label: moderation.aiClassification,
      variant: 'neutral',
      hint: '',
      action: 'Revisa el documento y decide.',
    };

  const reason = humanizeAiReason(moderation.aiReason, moderation.aiClassification);
  const confidence = confidenceLabel(moderation.aiScore);

  return (
    <Card className="border border-[var(--border)] bg-[var(--bg-alt)]">
      <div className="mb-4 flex items-center gap-2">
        <CpuChipIcon className="h-5 w-5 text-[var(--accent)]" />
        <h3 className="text-lg font-semibold text-[var(--text-h)]">Sugerencia de la IA</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-[var(--text-h)]">¿Qué parece ser?</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={config.variant}>{config.label}</Badge>
            {confidence ? (
              <span className="text-xs text-[var(--text-muted)]">
                Confianza {confidence.text} ({confidence.pct}%)
              </span>
            ) : null}
          </div>
          {config.hint ? (
            <p className="mt-2 text-sm text-[var(--text-muted)]">{config.hint}</p>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--text-h)]">Por qué lo sugiere</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{reason}</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/60 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            Qué debes hacer
          </p>
          <p className="mt-1 text-sm text-[var(--text-h)]">{config.action}</p>
        </div>
      </div>
    </Card>
  );
};
