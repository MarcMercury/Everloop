'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowLeft
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Story, StoryStatus, CanonReviewResult } from '@/types/database';

interface CanonReviewModalProps {
  story: Story;
  onClose: () => void;
  onStatusChange: (status: StoryStatus) => void;
}

export default function CanonReviewModal({ story, onClose, onStatusChange }: CanonReviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [reviewResult, setReviewResult] = useState<CanonReviewResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    lore: true,
    rules: true,
    tone: false,
  });

  useEffect(() => {
    async function performReview() {
      setLoading(true);
      
      // Simulate AI review (in production, this would call your AI API)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock review based on content
      const wordCount = story.word_count;
      const hasContent = wordCount > 50;
      
      // Simulate finding some issues
      const mockResult: CanonReviewResult = {
        loreConflicts: hasContent ? [
          {
            passage: 'Example passage from the story...',
            issue: 'The described use of Weaving without a binding pact contradicts established canon.',
            severity: 'warning',
            suggestion: 'Consider adding context about how the character gained their Weaving abilities through a pact or the Gift.',
          },
        ] : [],
        ruleViolations: [],
        toneIssues: hasContent ? [
          {
            passage: 'The dialogue felt modern...',
            issue: 'Some phrasing feels too contemporary for the mythic tone.',
            severity: 'suggestion',
            suggestion: 'Consider using more formal, archaic language patterns to match Everloop\'s established voice.',
          },
        ] : [],
        summary: hasContent 
          ? 'Your story shows promise and connects well with established arcs. A few minor adjustments would strengthen its place in the canon.'
          : 'Your story needs more content before it can be properly reviewed. Please add at least a few paragraphs of narrative.',
        canApprove: wordCount > 100,
      };
      
      setReviewResult(mockResult);
      
      // Save review to database
      const supabase = createClient();
      const blockingCount = mockResult.loreConflicts.filter(c => c.severity === 'blocking').length +
                           mockResult.ruleViolations.filter(r => r.severity === 'blocking').length;
      
      await supabase.from('canon_reviews').insert({
        story_id: story.id,
        review_result: mockResult as unknown as Record<string, unknown>,
        blocking_issues_count: blockingCount,
      });
      
      // Update story status
      const newStatus: StoryStatus = blockingCount > 0 ? 'changes_requested' : 
                                     mockResult.canApprove ? 'approved' : 'in_review';
      
      await supabase
        .from('stories')
        .update({ status: newStatus })
        .eq('id', story.id);
      
      setLoading(false);
    }

    performReview();
  }, [story]);

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'blocking':
        return <AlertCircle className="w-5 h-5 text-[var(--error)]" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />;
      default:
        return <CheckCircle className="w-5 h-5 text-[var(--success)]" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'blocking':
        return 'border-[var(--error)] bg-[var(--error)]/10';
      case 'warning':
        return 'border-[var(--warning)] bg-[var(--warning)]/10';
      default:
        return 'border-[var(--success)] bg-[var(--success)]/10';
    }
  };

  const handleReturn = () => {
    if (reviewResult) {
      const blockingCount = reviewResult.loreConflicts.filter(c => c.severity === 'blocking').length +
                           reviewResult.ruleViolations.filter(r => r.severity === 'blocking').length;
      const newStatus: StoryStatus = blockingCount > 0 ? 'changes_requested' : 
                                     reviewResult.canApprove ? 'approved' : 'draft';
      onStatusChange(newStatus);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">Canon Review</h2>
              <p className="text-sm text-[var(--foreground-muted)]">{story.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--foreground-muted)] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-[var(--accent-gold)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analyzing Your Story</h3>
              <p className="text-[var(--foreground-muted)]">
                The AI Lore Guardian is checking your story against Everloop&apos;s canon...
              </p>
              <div className="mt-6 space-y-2 text-sm text-[var(--foreground-muted)]">
                <p>✓ Checking lore consistency...</p>
                <p>✓ Verifying universe rules...</p>
                <p>✓ Analyzing tone and style...</p>
              </div>
            </div>
          ) : reviewResult ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className={`p-4 rounded-lg border ${reviewResult.canApprove ? 'border-[var(--success)] bg-[var(--success)]/10' : 'border-[var(--warning)] bg-[var(--warning)]/10'}`}>
                <div className="flex items-start gap-3">
                  {reviewResult.canApprove ? (
                    <CheckCircle className="w-6 h-6 text-[var(--success)] flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-[var(--warning)] flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold mb-1">
                      {reviewResult.canApprove ? 'Ready for Canon' : 'Revisions Recommended'}
                    </h3>
                    <p className="text-sm text-[var(--foreground-muted)]">{reviewResult.summary}</p>
                  </div>
                </div>
              </div>

              {/* Lore Conflicts */}
              {reviewResult.loreConflicts.length > 0 && (
                <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('lore')}
                    className="w-full p-4 flex items-center justify-between bg-[var(--background-tertiary)] hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />
                      <span className="font-semibold">Lore Conflicts</span>
                      <span className="text-sm text-[var(--foreground-muted)]">({reviewResult.loreConflicts.length})</span>
                    </div>
                    {expandedSections.lore ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.lore && (
                    <div className="p-4 space-y-4">
                      {reviewResult.loreConflicts.map((conflict, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(conflict.severity)}`}>
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(conflict.severity)}
                            <div className="flex-1">
                              <p className="text-sm italic mb-2 text-[var(--foreground-muted)]">&quot;{conflict.passage}&quot;</p>
                              <p className="font-medium mb-2">{conflict.issue}</p>
                              <p className="text-sm text-[var(--foreground-muted)]">
                                <strong>Suggestion:</strong> {conflict.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Rule Violations */}
              {reviewResult.ruleViolations.length > 0 && (
                <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('rules')}
                    className="w-full p-4 flex items-center justify-between bg-[var(--background-tertiary)] hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-[var(--error)]" />
                      <span className="font-semibold">Rule Violations</span>
                      <span className="text-sm text-[var(--foreground-muted)]">({reviewResult.ruleViolations.length})</span>
                    </div>
                    {expandedSections.rules ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.rules && (
                    <div className="p-4 space-y-4">
                      {reviewResult.ruleViolations.map((violation, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(violation.severity)}`}>
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(violation.severity)}
                            <div className="flex-1">
                              <p className="font-medium mb-2">{violation.rule}: {violation.issue}</p>
                              <p className="text-sm text-[var(--foreground-muted)]">
                                <strong>Suggestion:</strong> {violation.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tone Issues */}
              {reviewResult.toneIssues.length > 0 && (
                <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('tone')}
                    className="w-full p-4 flex items-center justify-between bg-[var(--background-tertiary)] hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                      <span className="font-semibold">Tone & Style Suggestions</span>
                      <span className="text-sm text-[var(--foreground-muted)]">({reviewResult.toneIssues.length})</span>
                    </div>
                    {expandedSections.tone ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.tone && (
                    <div className="p-4 space-y-4">
                      {reviewResult.toneIssues.map((issue, index) => (
                        <div key={index} className="p-4 rounded-lg border border-[var(--success)] bg-[var(--success)]/10">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-[var(--success)] flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm italic mb-2 text-[var(--foreground-muted)]">&quot;{issue.passage}&quot;</p>
                              <p className="font-medium mb-2">{issue.issue}</p>
                              <p className="text-sm text-[var(--foreground-muted)]">
                                <strong>Suggestion:</strong> {issue.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* No issues */}
              {reviewResult.loreConflicts.length === 0 && 
               reviewResult.ruleViolations.length === 0 && 
               reviewResult.toneIssues.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-[var(--success)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
                  <p className="text-[var(--foreground-muted)]">
                    Your story aligns well with Everloop&apos;s established canon.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border)] flex justify-between">
          <button
            onClick={handleReturn}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Editor
          </button>
          {!loading && reviewResult?.canApprove && (
            <div className="flex items-center gap-2 text-[var(--success)]">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Story Approved!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
