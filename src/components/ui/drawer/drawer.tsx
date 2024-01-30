import React from "react";
import { styled } from "styled-components";

interface IDrawer {
  header: any;
  handleClose?: () => void;
  isOpen?: boolean;
  children?: JSX.Element;
}

const StyledDrawer = styled.div`
  position: fixed;
  overflow: hidden;
  z-index: 50;
`;

const StyledDrawerSection = styled.section`
  border-top-width: 1px;
  border-left-width: 1px;
  border-bottom-width: 1px;
  border-bottom-left-radius: 1rem;
  border-top-left-radius: 1rem;
  width: 100vw;
  max-width: 320px;
  position: absolute;
  right: 0px;
  height: 100%;
  background-color: ${(props) => props.theme?.colors?.secondary};
`;

export function Drawer({ children, isOpen, handleClose, header }: IDrawer) {
  return (
    <StyledDrawer
      className={
        " bg-opacity-25 inset-0 transform ease-in-out " +
        (isOpen
          ? " transition-opacity opacity-100 duration-500 translate-x-0  "
          : " transition-all delay-500 opacity-0 translate-x-full  ")
      }
    >
      <StyledDrawerSection
        className={
          " border-t-white border-b-white border-l-white shadow-xl delay-400 duration-500 ease-in-out transition-all transform  " +
          (isOpen ? " translate-x-0 " : " translate-x-full ")
        }
      >
        <article className="relative w-screen max-w-xs pb-10 flex flex-col space-y-6 overflow-y-scroll h-full">
          <header className="p-4 font-bold text-lg ">{header}</header>
          {children}
        </article>
      </StyledDrawerSection>
      <section
        className=" w-screen h-full cursor-pointer "
        onClick={handleClose}
      ></section>
    </StyledDrawer>
  );
}
