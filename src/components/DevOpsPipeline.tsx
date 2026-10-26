import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  Clock,
  GitBranch,
  GitCommit,
  Play,
  RotateCcw,
  ShieldCheck,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Server,
  Cpu,
  ArrowRight,
  ExternalLink,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PipelineStep {
  name: string;
  duration: string;
  passed: boolean;
}

interface PipelineStage {
  id: string;
  title: string;
  icon: "code" | "test" | "docker" | "deploy";
  runner: string;
  duration: string;
  steps: PipelineStep[];
  logs: string[];
}

interface WorkflowData {
  id: string;
  title: string;
  file: string;
  branch: string;
  commit: string;
  totalTime: string;
  stages: PipelineStage[];
}

const DUMMY_STAGE_LOGS: Record<string, string[]> = {
  "lint-audit": [
    "[parser] Resolving tsconfig paths and AST module dependency graph...",
    "[eslint] Validated strict imports and React hooks exhaustive-deps rules",
    "[snyk] Querying vulnerability database v2026.10... 0 CVEs detected",
    "[prettier] AST format check completed across all TypeScript components",
    "[audit] Security policy check: All dependencies comply with MIT/Apache licenses",
    "[check] Git conventional commit hook validated successfully",
  ],
  "test-build": [
    "[vitest] Worker #1: src/components/WorkSection.test.tsx passed (34ms)",
    "[vitest] Worker #2: src/components/DriftingJellyfish.test.tsx passed (58ms)",
    "[coverage] Lines: 94.6% | Branches: 91.2% | Functions: 95.0%",
    "[vite] Optimizing chunks: index.js (148 kB), vendor.js (210 kB)",
    "[bundle] Compression: Brotli 42.1 kB, Gzip 48.6 kB (budget: <200 kB)",
    "[test] All test suites completed cleanly with 0 flaky tests",
  ],
  "docker-package": [
    "[buildx] Transferring build context 1.24MB -> buildkit daemon",
    "[docker] CACHED [stage-1 2/5] RUN npm ci --production=false",
    "[docker] Step 6/8: COPY --from=builder /app/dist ./dist",
    "[trivy] Base image sha256:8f2a1b passed zero High/Critical CVE gate",
    "[registry] Uploading layer sha256:72c841 -> gcr.io/pooja-portfolio:latest",
    "[docker] Successfully tagged and pushed image to cloud registry (84.2MB)",
  ],
  "deploy-verify": [
    "[cloud-run] Route revision 00042: Allocating 100% traffic across edge instances",
    "[healthcheck] Probing /api/health -> HTTP 200 OK (response time: 16ms)",
    "[edge-cache] Purged stale surrogate-keys across global CDN edge points",
    "[ssl] Validated TLS 1.3 certificate status: Valid (issued by Google Trust Services)",
    "[telemetry] Prometheus exporter connected: 0 error rate detected",
    "[deploy] Blue-green zero-downtime rollover completed successfully",
  ],
  "pr-lint": [
    "[git] Comparing HEAD against origin/main (3 files modified)",
    "[linter] Strict rule check: react-hooks/exhaustive-deps passed",
    "[typecheck] 0 type errors across modified TypeScript files",
    "[commitlint] Message matches 'feat(devops): add ci/cd pipeline status'",
  ],
  "pr-test": [
    "[vitest] Running selective test suite for changed components...",
    "[snapshot] Comparing component visual DOM snapshots -> 100% match",
    "[cypress] Headless e2e smoke tests passed in 14.2s",
  ],
  "pr-preview": [
    "[deploy] Creating isolated preview environment on Vercel Edge...",
    "[dns] Assigned temporary URL: https://pr-42-pooja.preview.dev",
    "[lighthouse] Auditing preview URL: Performance: 98, Accessibility: 100",
    "[github] Updated PR #42 with live preview link and performance scorecard",
  ],
};

const WORKFLOWS: WorkflowData[] = [
  {
    id: "production",
    title: "Production Release",
    file: ".github/workflows/deploy-prod.yml",
    branch: "main",
    commit: "8f92ce1",
    totalTime: "2m 14s",
    stages: [
      {
        id: "lint-audit",
        title: "Quality & Security",
        icon: "code",
        runner: "ubuntu-latest",
        duration: "28s",
        steps: [
          { name: "ESLint & Prettier Validation", duration: "12s", passed: true },
          { name: "TypeScript Typecheck (tsc --noEmit)", duration: "9s", passed: true },
          { name: "Snyk Dependency Security Audit", duration: "7s", passed: true },
        ],
        logs: [
          "$ eslint --ext .ts,.tsx src/",
          "✓ 0 lint errors, 0 warnings",
          "$ tsc --noEmit",
          "✓ Clean compilation across 84 files",
          "$ snyk test --severity-threshold=high",
          "✓ 0 known vulnerabilities found",
        ],
      },
      {
        id: "test-build",
        title: "Build & Test Suite",
        icon: "test",
        runner: "node-22.x",
        duration: "46s",
        steps: [
          { name: "Unit & Integration Tests (Vitest)", duration: "24s", passed: true },
          { name: "Code Coverage Threshold (>92%)", duration: "8s", passed: true },
          { name: "Optimized Production Asset Bundle", duration: "14s", passed: true },
        ],
        logs: [
          "$ vitest run --coverage",
          "✓ 142/142 tests passing (100%)",
          "✓ Statements: 94.6% (Threshold 92%)",
          "$ vite build --mode production",
          "✓ Dist built: gzip 148kB (chunk size OK)",
        ],
      },
      {
        id: "docker-package",
        title: "Docker Container",
        icon: "docker",
        runner: "docker-buildx",
        duration: "34s",
        steps: [
          { name: "Multi-Stage Dockerfile Build", duration: "18s", passed: true },
          { name: "Trivy Container CVE Scan (0 High)", duration: "9s", passed: true },
          { name: "Push Image to Artifact Registry", duration: "7s", passed: true },
        ],
        logs: [
          "$ docker buildx build --target runner -t app:v2.4 .",
          "✓ Multi-stage image size: 84.2MB (alpine)",
          "$ trivy image --severity HIGH,CRITICAL app:v2.4",
          "✓ Zero vulnerabilities detected",
          "✓ Pushed sha256:8f92ce... to gcr.io/pooja-portfolio",
        ],
      },
      {
        id: "deploy-verify",
        title: "Zero-Downtime Deploy",
        icon: "deploy",
        runner: "cloud-run / vercel",
        duration: "26s",
        steps: [
          { name: "Blue-Green Rolling Deployment", duration: "14s", passed: true },
          { name: "Synthetic Health Check (HTTP 200)", duration: "6s", passed: true },
          { name: "Edge CDN Cache Purge & Warmup", duration: "6s", passed: true },
        ],
        logs: [
          "$ gcloud run deploy pooja-portfolio --traffic=100",
          "✓ New revision 00042-xyz live",
          "$ curl -sI https://poojabhagwat.dev/api/health",
          "✓ HTTP/2 200 OK (latency: 18ms)",
          "✓ Edge CDN cache purged globally (24 POPs)",
        ],
      },
    ],
  },
  {
    id: "pull-request",
    title: "PR CI Validation",
    file: ".github/workflows/pr-check.yml",
    branch: "feat/devops-pipeline",
    commit: "4c11b89",
    totalTime: "1m 32s",
    stages: [
      {
        id: "pr-lint",
        title: "Lint & Standards",
        icon: "code",
        runner: "ubuntu-latest",
        duration: "21s",
        steps: [
          { name: "Diff Linter & Conventional Commits", duration: "8s", passed: true },
          { name: "Strict TypeScript Compile Check", duration: "13s", passed: true },
        ],
        logs: [
          "$ commitlint --from=origin/main",
          "✓ Commit header matches conventional standard",
          "$ tsc --noEmit",
          "✓ 0 type errors detected",
        ],
      },
      {
        id: "pr-test",
        title: "Regression Tests",
        icon: "test",
        runner: "node-22.x",
        duration: "38s",
        steps: [
          { name: "Component Unit Tests", duration: "22s", passed: true },
          { name: "Snapshot Visual Regression Check", duration: "16s", passed: true },
        ],
        logs: [
          "$ vitest run src/components/",
          "✓ 118 component suites passed",
          "✓ 0 visual regressions against baseline",
        ],
      },
      {
        id: "pr-preview",
        title: "Preview Environment",
        icon: "deploy",
        runner: "ephemeral-env",
        duration: "33s",
        steps: [
          { name: "Ephemeral Preview Staging URL", duration: "21s", passed: true },
          { name: "Lighthouse Performance (98/100)", duration: "12s", passed: true },
        ],
        logs: [
          "✓ Preview deployed to https://pr-42-pooja.dev",
          "✓ Lighthouse Score: Performance 98, A11y 100",
          "✓ Automated comment posted to GitHub PR #42",
        ],
      },
    ],
  },
];

const DEVOPS_TOOLS = [
  { name: "GitHub Actions", desc: "Automated CI/CD pipelines" },
  { name: "Docker", desc: "Containerized environments" },
  { name: "Google Cloud Run", desc: "Serverless container deployment" },
  { name: "Vercel Edge", desc: "Global CDN & microfrontends" },
  { name: "Vitest & Jest", desc: "Automated test coverage" },
  { name: "Trivy & Snyk", desc: "SAST & vulnerability scanning" },
  { name: "Prometheus", desc: "Metrics & uptime telemetry" },
];

export function DevOpsPipeline() {
  const [activeWorkflow, setActiveWorkflow] = useState<string>("production");
  const [activeStageId, setActiveStageId] = useState<string>("lint-audit");
  const [running, setRunning] = useState<boolean>(false);
  const [runProgress, setRunProgress] = useState<number>(4); // all completed initially
  const [liveLogs, setLiveLogs] = useState<Record<string, string[]>>({});
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  const consoleOutputRef = useRef<HTMLDivElement>(null);

  const workflow = WORKFLOWS.find((w) => w.id === activeWorkflow) ?? WORKFLOWS[0];
  const activeStage = workflow.stages.find((s) => s.id === activeStageId) ?? workflow.stages[0];

  // Select a stage, highlight it, and trigger a load animation for its logs
  const handleSelectStage = (stageId: string) => {
    if (stageId === activeStageId && !loadingLogs) return;
    setLoadingLogs(true);
    setActiveStageId(stageId);
    setTimeout(() => {
      setLoadingLogs(false);
    }, 280);
  };

  // Determine which stage is currently running
  const runningStageIndex = running ? runProgress : null;
  const isCurrentStageRunning =
    running &&
    runningStageIndex !== null &&
    runningStageIndex < workflow.stages.length &&
    workflow.stages[runningStageIndex]?.id === activeStage.id;

  // Real-time live simulation: add a new dummy log line every 3 seconds while in running state
  useEffect(() => {
    if (!isCurrentStageRunning) return;

    const pool = DUMMY_STAGE_LOGS[activeStage.id] ?? [
      "[telemetry] Container heartbeat healthy (cpu: 4.2%, mem: 84MB)",
      "[logger] Live stdout packet emitted from execution container",
      "[network] Stream connection active: 0 dropped packets",
    ];

    let logCounter = 0;
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const lineText = pool[logCounter % pool.length];
      const logLine = `[${timestamp}] ${lineText}`;
      logCounter++;

      setLiveLogs((prev) => {
        const currentList = prev[activeStage.id] ?? activeStage.logs;
        return {
          ...prev,
          [activeStage.id]: [...currentList, logLine],
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isCurrentStageRunning, activeStage.id, activeStage.logs]);

  // Auto-scroll console to bottom as new live logs stream in
  useEffect(() => {
    if (consoleOutputRef.current) {
      consoleOutputRef.current.scrollTop = consoleOutputRef.current.scrollHeight;
    }
  }, [liveLogs, activeStageId, isCurrentStageRunning, loadingLogs]);

  // Re-run workflow simulation
  const handleRerun = () => {
    if (running) return;
    setRunning(true);
    setRunProgress(0);
    setActiveStageId(workflow.stages[0].id);

    // Reset logs with initial runner header
    const initialLogs: Record<string, string[]> = {};
    workflow.stages.forEach((s) => {
      initialLogs[s.id] = [s.logs[0] ?? `$ running ${s.title}...`];
    });
    setLiveLogs(initialLogs);

    const stageCount = workflow.stages.length;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setRunProgress(step);
      if (step < stageCount) {
        setActiveStageId(workflow.stages[step].id);
      }
      if (step >= stageCount) {
        clearInterval(interval);
        setRunning(false);
      }
    }, 7000);
  };

  const toggleLiveSimulationForActiveStage = () => {
    if (running) {
      setRunning(false);
      setRunProgress(workflow.stages.length);
    } else {
      const idx = workflow.stages.findIndex((s) => s.id === activeStage.id);
      setRunProgress(idx >= 0 ? idx : 0);
      setRunning(true);
    }
  };

  useEffect(() => {
    setActiveStageId(workflow.stages[0].id);
    setRunProgress(workflow.stages.length);
  }, [activeWorkflow, workflow.stages]);

  const renderIcon = (type: PipelineStage["icon"]) => {
    switch (type) {
      case "code":
        return <Code2 size={18} />;
      case "test":
        return <Layers size={18} />;
      case "docker":
        return <Cpu size={18} />;
      case "deploy":
        return <Server size={18} />;
    }
  };

  return (
    <section
      id="pipeline"
      className="section page-gutter devops-pipeline-section"
      aria-labelledby="pipeline-heading"
    >
      <div className="devops-backdrop-glow" aria-hidden="true" />

      {/* Header */}
      <div className="devops-header">
        <div>
          <p className="section-label">// DEVOPS &amp; CI/CD PIPELINE</p>
          <h2 id="pipeline-heading" className="display section-heading">
            AUTOMATED
            <br />
            SHIP CYCLE.
          </h2>
        </div>
        <div className="devops-header-meta">
          <p className="devops-lead">
            Every feature is verified through automated linting, test suites, containerized
            packaging, and zero-downtime rolling cloud deployment.
          </p>
          <div className="pipeline-stats-strip">
            <div className="pipeline-stat">
              <span className="mono">SUCCESS RATE</span>
              <strong>99.6%</strong>
            </div>
            <div className="pipeline-stat">
              <span className="mono">AVG BUILD</span>
              <strong>2m 14s</strong>
            </div>
            <div className="pipeline-stat">
              <span className="mono">DEPLOY FREQUENCY</span>
              <strong>Continuous</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Navigation Bar */}
      <div className="pipeline-toolbar">
        <div className="pipeline-workflow-selector">
          <span className="pipeline-toolbar-label mono">WORKFLOW:</span>
          {WORKFLOWS.map((wf) => (
            <button
              key={wf.id}
              type="button"
              className={`pipeline-tab ${activeWorkflow === wf.id ? "is-active" : ""}`}
              onClick={() => setActiveWorkflow(wf.id)}
            >
              <GitBranch size={13} className="tab-icon" aria-hidden="true" />
              <span>{wf.title}</span>
            </button>
          ))}
        </div>

        <div className="pipeline-toolbar-actions">
          <div className="pipeline-branch-pill mono">
            <GitCommit size={13} aria-hidden="true" />
            <span>{workflow.branch}</span>
            <span className="commit-hash">@{workflow.commit}</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="pipeline-rerun-btn"
            disabled={running}
            onClick={handleRerun}
          >
            {running ? (
              <>
                <RotateCcw size={13} className="animate-spin mr-1.5" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Play size={13} className="mr-1.5 fill-current" />
                <span>Re-run Pipeline</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Pipeline Diagram & Stages */}
      <div className="pipeline-diagram-wrapper">
        <div className="pipeline-diagram">
          {workflow.stages.map((stage, idx) => {
            const isCompleted = idx < runProgress;
            const isCurrent = idx === runProgress && running;
            const isPending = idx > runProgress;
            const isSelected = activeStage.id === stage.id;

            return (
              <div key={stage.id} className="pipeline-stage-node">
                {/* Stage Glass Card with Interactive Selection */}
                <div
                  role="button"
                  tabIndex={0}
                  className={`pipeline-stage-card ${isSelected ? "is-selected" : ""} ${
                    isCurrent ? "is-running" : ""
                  } ${isCompleted ? "is-passed" : ""}`}
                  onClick={() => handleSelectStage(stage.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectStage(stage.id);
                    }
                  }}
                  aria-label={`${stage.title} stage. Click to inspect console logs.`}
                  aria-pressed={isSelected}
                >
                  <div className="stage-card-head">
                    <div className="stage-icon-badge">{renderIcon(stage.icon)}</div>
                    <div className="stage-status-indicator">
                      {isCompleted && (
                        <span className="status-pill-passed">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          <span>PASSED</span>
                        </span>
                      )}
                      {isCurrent && (
                        <span className="status-pill-running">
                          <RotateCcw size={13} className="animate-spin text-cyan-400" />
                          <span>RUNNING</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="status-pill-pending">
                          <Clock size={13} className="text-muted-foreground" />
                          <span>QUEUED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="stage-title">{stage.title}</h3>
                  <div className="stage-meta mono">
                    <span>{stage.runner}</span>
                    <span className="bullet">·</span>
                    <span>{stage.duration}</span>
                  </div>

                  {/* Step Checklist */}
                  <ul className="stage-steps-list">
                    {stage.steps.map((st, sidx) => (
                      <li key={sidx} className="stage-step-item">
                        <span
                          className={`step-bullet ${
                            isCompleted ? "passed" : isCurrent ? "running" : "pending"
                          }`}
                        />
                        <span className="step-name">{st.name}</span>
                        <span className="step-time mono">{st.duration}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="stage-card-footer mono">
                    {isSelected ? (
                      <span className="footer-active-badge">VIEWING LOGS</span>
                    ) : (
                      <span>CLICK FOR LOGS</span>
                    )}
                    <ArrowRight
                      size={12}
                      className={`footer-arrow ${isSelected ? "arrow-active" : ""}`}
                    />
                  </div>
                </div>

                {/* Animated Connection Arrow / Track to next stage */}
                {idx < workflow.stages.length - 1 && (
                  <div className="pipeline-connector-track" aria-hidden="true">
                    <svg
                      className="connector-svg"
                      viewBox="0 0 70 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 4 12 L 66 12"
                        className="connector-path-bg"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 4 12 L 66 12"
                        className={`connector-path-flow ${
                          idx < runProgress ? "flow-active" : "flow-idle"
                        }`}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div
                      className={`connector-pulse-dot ${idx < runProgress ? "is-pulsing" : ""}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Live Console Output Drawer */}
      <div className={`pipeline-console-card ${loadingLogs ? "is-loading" : ""}`}>
        {loadingLogs && <div className="console-loading-bar" aria-hidden="true" />}
        <div className="console-card-header">
          <div className="console-window-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <div className="console-title mono">
            <Terminal size={14} className="mr-1.5" />
            <span>
              {workflow.file} &gt; {activeStage.title} ({activeStage.runner})
            </span>
          </div>
          <div className="console-header-right">
            <button
              type="button"
              className="console-live-toggle-btn mono"
              onClick={toggleLiveSimulationForActiveStage}
              title={
                isCurrentStageRunning
                  ? "Pause 3s live log stream"
                  : "Start real-time 3s live log simulation on current stage"
              }
            >
              {isCurrentStageRunning ? (
                <>
                  <span className="live-dot-pulse" />
                  <span>Streaming Every 3s</span>
                </>
              ) : (
                <>
                  <Play size={11} className="mr-1 fill-current" />
                  <span>Simulate Live (3s)</span>
                </>
              )}
            </button>
            <div
              className={`console-status-badge mono ${
                isCurrentStageRunning ? "live-streaming" : ""
              }`}
            >
              {isCurrentStageRunning ? (
                <>
                  <RotateCcw size={12} className="animate-spin text-cyan-400 mr-1" />
                  <span>RUNNING</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={13} className="text-emerald-400 mr-1" />
                  <span>EXIT CODE 0</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          key={`${activeStage.id}-${loadingLogs ? "loading" : "ready"}`}
          className={`console-output mono ${loadingLogs ? "is-loading-logs" : "is-loaded-logs"}`}
          ref={consoleOutputRef}
        >
          {loadingLogs ? (
            <div className="console-loading-state">
              <RotateCcw size={14} className="animate-spin text-primary" />
              <span>Loading telemetry buffer for {activeStage.title}...</span>
            </div>
          ) : (
            (liveLogs[activeStage.id] ?? activeStage.logs).map((line, lidx) => (
              <div
                key={`${activeStage.id}-${lidx}`}
                className="console-log-line log-load-animation"
                style={{ animationDelay: `${Math.min(lidx * 0.04, 0.35)}s` }}
              >
                <span className="line-prefix">{line.startsWith("$") ? ">" : " "}</span>
                <span
                  className={`line-text ${
                    line.includes("✓")
                      ? "log-success"
                      : line.startsWith("$")
                        ? "log-cmd"
                        : line.startsWith("[")
                          ? "log-live"
                          : "log-info"
                  }`}
                >
                  {line}
                </span>
              </div>
            ))
          )}
          {!loadingLogs && isCurrentStageRunning && (
            <div className="console-log-line console-blinking-cursor">
              <span className="line-prefix">&gt;</span>
              <span className="cursor-indicator" />
            </div>
          )}
        </div>
      </div>

      {/* DevOps Stack Badges */}
      <div className="devops-tools-strip">
        <div className="devops-tools-label mono">
          <Sparkles size={13} className="mr-1 text-primary" />
          <span>PRODUCTION TOOLCHAIN</span>
        </div>
        <div className="devops-tags-grid">
          {DEVOPS_TOOLS.map((tool) => (
            <div key={tool.name} className="devops-tool-tag">
              <span className="tool-name">{tool.name}</span>
              <span className="tool-desc">{tool.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
