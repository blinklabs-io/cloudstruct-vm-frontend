import version from "src/version";

const Footer = () => {
  return (
    <div className="background fixed inset-x-0 bottom-0 mt-auto w-full flex flex-row items-center opacity-50 p-5 text-xxs sm:text-sm">
      <div className="ml-2 mr-2 text-right flex flex-row w-fit">
        © 2022 CloudStruct, LLC.
      </div>
      <div className="ml-2 mr-2 text-left flex flex-row w-fit">
        UI version: {version}
      </div>
    </div>
  );
};

export default Footer;
