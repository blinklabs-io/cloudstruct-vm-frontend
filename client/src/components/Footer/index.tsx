import version from "src/version";

const Footer = () => {
  return (
    // <div className={"background text-lg p-5 shadow-2xl rounded-2xl w-56 h-fit"}>
    <div className="mt-auto w-full flex flex-col items-center opacity-50 p-5 shadow-2xl rounded-2xl text-xxs sm:text-sm">
      <div className="break-all text-center">UI version: {version}</div>
    </div>
  );
};

export default Footer;
