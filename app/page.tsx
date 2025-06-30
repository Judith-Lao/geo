import { ContentForm } from "@/components/home/content-form";

export default async function Home() {
  return (
    <>
      <div className="z-10 w-full max-w-screen-md px-5 xl:px-0">
        <a
          href="https://twitter.com/steventey/status/1613928948915920896"
          target="_blank"
          rel="noreferrer"
          className="mx-auto mb-5 flex max-w-fit animate-fade-up items-center justify-center space-x-2 overflow-hidden rounded-full bg-blue-100 px-7 py-2 transition-colors hover:bg-blue-200"
        >
          <p className="text-sm font-semibold text-[#1d9bf0]">
            Introducing GEO for Brands
          </p>
        </a>
        <h1
          className="animate-fade-up bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent opacity-0 drop-shadow-sm [text-wrap:balance] md:text4l md:leading-[3rem]"
          style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
        >
          Rank in ChatGPT Search with Generative Engine Optimization
        </h1>
        <p
          className="mt-6 animate-fade-up text-center text-gray-500 opacity-0 [text-wrap:balance] md:text-xl"
          style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
        >
          Increase your website visibility and implement textual modifications independent of the exact queries of your customers.
        </p>
      </div>
      <div className="my-10 grid w-full max-w-screen-md animate-fade-up grid-cols-1 gap-5 px-5 xl:px-0" style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}>
        <ContentForm/>
      </div>
    </>
  );
}
