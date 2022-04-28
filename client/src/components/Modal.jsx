import { useEffect, useRef } from 'react';
import '../stylesheets/Modal.css';

const Modal = ({ children, isOpen }) => {
  const modalRef = useRef();

  function centerModal() {
    const width = modalRef.current.getBoundingClientRect().width;
    const height = modalRef.current.getBoundingClientRect().height;

    modalRef.current.style.top = `calc(50vh - ${height/2}px - 50px)`;
    modalRef.current.style.left = `calc(50vw - ${width/2}px + 200px)`;
  }

  useEffect(() => {
    if (!(modalRef && modalRef.current))
      return;
    
    const modal = modalRef.current;

    if (isOpen !== modal.open)
      isOpen ? modal.showModal() : modal.close();

  }, [ modalRef, isOpen ]);

  useEffect(() => {
    centerModal();
    window.onresize = centerModal;
  },
  [ isOpen, children ]);

  return (
    <dialog ref={modalRef} className="Modal">
      { children }
    </dialog>
  );
}

export default Modal;
