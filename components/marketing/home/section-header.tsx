import * as React from 'react';

export function SectionHeader(props: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {props.title}
        </h2>
        {props.description ? (
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            {props.description}
          </p>
        ) : null}
      </div>
      {props.action ? <div className="sm:pb-1">{props.action}</div> : null}
    </div>
  );
}
