import { Marked } from '@ts-stack/markdown';
import { PoolInfo } from "src/entities/vm.entities";

export default function Pool({ pool }: { pool: PoolInfo }) {
  Marked.setOptions({isNoP: true});
  let parsed = Marked.parse(`${pool.description}`)
  return (
    <div className="background p-5 shadow-2xl rounded-2xl flex flex-row gap-4">
      <div className="h-full w-14 flex items-center justify-center">
        <img alt="pool logo" className="w-full" src={pool.logo}></img>
      </div>
      <div className="w-full flex flex-col gap-2">
        <div className="font-extrabold text-lg">
          [{pool.ticker}] {pool.name}
        </div>
        <div className="break-normal" dangerouslySetInnerHTML={{ __html: parsed === "null" ? "" : parsed }} />
      </div>
    </div>
  );
}
