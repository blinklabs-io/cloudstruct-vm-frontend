import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Project from "src/components/Projects/Project";
import useProjects from "src/hooks/cardano/projects/useProjects";
import Loading from "src/pages/Loading";

const Projects = () => {
  const { projects, loading } = useProjects();

  return loading ? (
    <Loading></Loading>
  ) : (
    <>
      <p className="text-3xl">Explore Projects</p>
      <div
        className={
          "background rounded-2xl p-5 flex flex-row items-center gap-2"
        }
      >
        <div className="text-premium">
          <FontAwesomeIcon icon={faLightbulb} />
        </div>
        Projects are distributed on this platform by CloudStruct to CSCS
        delegators as loyalty rewards
      </div>
      <div className="flex flex-col gap-4">
        {projects.map((project, i) => {
          return <Project key={i} projectData={project}></Project>;
        })}
      </div>
    </>
  );
};

export default Projects;
