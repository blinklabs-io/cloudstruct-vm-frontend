import { faDiscord, faTelegram } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Feedback() {
  return (
    <div className="w-full flex flex-col gap-8 items-center">
      <div className="text-3xl">Feedback</div>
      <div className="background p-5 shadow-2xl rounded-2xl w-full sm:w-96">
        <a
          href="https://discord.gg/5fPRZnX4qW"
          target="_blank"
          rel="noreferrer"
        >
          <div className="cs-button p-5 shadow-2xl rounded-2xl text-center w-full mt-5">
            Discuss on Discord <FontAwesomeIcon icon={faDiscord} />
          </div>
        </a>
        <a href="https://t.me/CSCS_pool" target="_blank" rel="noreferrer">
          <div className="cs-button p-5 shadow-2xl rounded-2xl text-center w-full mt-5">
            Discuss on Telegram <FontAwesomeIcon icon={faTelegram} />
          </div>
        </a>
      </div>
    </div>
  );
}

export default Feedback;
