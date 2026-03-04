import React from "react";

export default function PortalBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-zinc-50 dark:bg-black pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_560px_at_50%_220px,#ef444415,transparent_70%)] dark:bg-[radial-gradient(circle_560px_at_50%_220px,#ef444433,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415533_1px,transparent_1px),linear-gradient(to_bottom,#33415533_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#33415566_1px,transparent_1px),linear-gradient(to_bottom,#33415566_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  );
}
