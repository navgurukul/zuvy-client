import React from "react";

type Props = {
  Chapter1: string;
  Chapter2: string;
  article: string;
  Quiz: string;
  codingProject: string;
};

function Sidebar({ ...props }: Props) {
  return (
    <aside
      className={`flex h-screen w-64 flex-col overflow-y-auto border-r bg-white px-3 py-5 z-100 `}
    >
      <div className="mt-6 flex flex-1 flex-col justify-between ">
        <nav className="-mx-3 space-y-6 ">
          <div className="space-y-2 ">
            <label className="px-3 flex flex-start text-sm font-semibold uppercase text-black">
              Chapter List
            </label>
            <a
              className="flex transform items-center rounded-lg px-3 py-2  transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700"
              href="#"
            >
              <span className="mx-2 text-sm font-medium">{props.Chapter1}</span>
            </a>
            <a
              className="flex transform items-center rounded-lg px-2 py-2  transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700"
              href="#"
            >
              <span className="mx-2 text-sm font-medium">{props.Chapter2}</span>
            </a>
            <a
              className="flex transform items-center rounded-lg px-3 py-2  transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700"
              href="#"
            >
              <span className="mx-2 text-sm font-medium">{props.article}</span>
            </a>
            <a
              className="flex transform items-center rounded-lg px-3 py-2  transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700"
              href="#"
            >
              <span className="mx-2 text-sm font-medium">{props.Quiz}</span>
            </a>
            <a
              className="flex transform items-center rounded-lg px-3 py-2  transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700"
              href="#"
            >
              <span className="mx-2 text-sm font-medium">
                {props.codingProject}
              </span>
            </a>
          </div>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
