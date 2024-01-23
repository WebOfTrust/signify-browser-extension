import React from "react";

export const Drawer = ({ children, isOpen, handleClose, header }) => {
  return (
    <div
      className={
        " fixed overflow-hidden z-50 bg-gray-dark bg-opacity-25 inset-0 transform ease-in-out " +
        (isOpen
          ? " transition-opacity opacity-100 duration-500 translate-x-0  "
          : " transition-all delay-500 opacity-0 translate-x-full  ")
      }
    >
      <section
        className={
          "rounded-bl-2xl rounded-tl-2xl border-t border-l border-b border-t-white border-b-white border-l-white w-screen max-w-xs right-0 absolute bg-gray-dark h-full shadow-xl delay-400 duration-500 ease-in-out transition-all transform  " +
          (isOpen ? " translate-x-0 " : " translate-x-full ")
        }
      >
        <article className="relative w-screen max-w-xs pb-10 flex flex-col space-y-6 overflow-y-scroll h-full">
          <header className="p-4 font-bold text-lg ">{header}</header>
          {children}
        </article>
      </section>
      <section
        className=" w-screen h-full cursor-pointer "
        onClick={handleClose}
      ></section>
    </div>
  );
};
