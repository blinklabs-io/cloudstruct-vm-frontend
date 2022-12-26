import { Marked } from '@ts-stack/markdown';
import { StakePoolInfo } from "src/entities/common.entities";

export default function FeaturedPool({ pool }: { pool: StakePoolInfo }) {
  Marked.setOptions({isNoP: true});
  let parsed = Marked.parse(`${pool.description}`)
  return (
    <div className="background p-5 shadow-2xl rounded-2xl flex flex-row gap-4">
      <div className="w-72 flex flex-row items-center justify-center">
        <img alt="pool logo" className="w-full" src={pool.logo}></img>
      </div>
      <div className="w-full flex flex-col gap-2">
        <div className="font-extrabold text-lg">
          ({pool.ticker}) {pool.name}
        </div>
        <div className="break-normal" dangerouslySetInnerHTML={{ __html: parsed === "null" ? "" : parsed }} />
      </div>
    </div>
  );
}
