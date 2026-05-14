import projectDispatchMap from "@/data/project-dispatch-map.json";

interface ProjectDispatchRecord {
  repo: string;
  dispatchable: boolean;
}

interface ProjectDispatchMap {
  projects: Record<string, ProjectDispatchRecord>;
  aliases: Record<string, string>;
}

const dispatchMap = projectDispatchMap as ProjectDispatchMap;

export interface ProjectDispatchRoute {
  inputProject: string;
  project: string;
  repo?: string;
  dispatchable: boolean;
  reason?: string;
}

export function resolveProjectDispatch(inputProject: string): ProjectDispatchRoute {
  const normalizedInput = inputProject.trim();
  const canonicalProject = dispatchMap.aliases[normalizedInput] ?? normalizedInput;
  const config = dispatchMap.projects[canonicalProject];

  if (!config) {
    return {
      inputProject: normalizedInput,
      project: canonicalProject,
      dispatchable: false,
      reason: `No dispatcher mapping is configured for project '${normalizedInput}'.`,
    };
  }

  if (!config.dispatchable) {
    return {
      inputProject: normalizedInput,
      project: canonicalProject,
      repo: config.repo,
      dispatchable: false,
      reason: `Project '${canonicalProject}' is mapped but not enabled for automatic dispatch.`,
    };
  }

  return {
    inputProject: normalizedInput,
    project: canonicalProject,
    repo: config.repo,
    dispatchable: true,
  };
}

export function getDispatchableProjectRepos() {
  return dispatchMap.projects;
}
