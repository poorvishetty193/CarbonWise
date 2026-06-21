import React from 'react';

/**
 *  Offset Marketplace function.
 * @returns Shape or unit of the return value.
 * @throws {never} This function does not throw.
 */
export function OffsetMarketplace() {
  return (
    <section aria-labelledby="offset-title" className="border-t border-surface-border pt-6">
      <h3 id="offset-title" className="text-lg font-display font-bold text-forest-900 mb-3">
        Carbon Offset Marketplace
      </h3>
      <p className="text-xs text-slateBlue-500 mb-4">
        Verified offset projects aligned with Gold Standard and Verra VCS frameworks.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { name: 'Gold Standard', url: 'https://www.goldstandard.org/impact-quantification/carbon-offsets', emoji: 'dY' },
          { name: 'Verra VCS', url: 'https://verra.org/project/vcs-program/', emoji: 'dYO?' },
          { name: 'Cool Effect', url: 'https://www.cooleffect.org', emoji: '?,,?' },
        ].map((project) => (
          <a
            key={project.name}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white border border-surface-border rounded-2xl hover:border-forest-200 hover:shadow-card-hover transition-all duration-200 text-sm font-semibold text-slateBlue-800"
          >
            <span className="text-xl">{project.emoji}</span>
            {project.name}
          </a>
        ))}
      </div>
    </section>
  );
}
