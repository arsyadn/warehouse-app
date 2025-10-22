import { Modal } from "antd";
import React from "react";

type ModalConfirmationProps = {
  isModalOpen: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  loading: boolean;
  text: string;
};
const ModalConfirmation: React.FC<ModalConfirmationProps> = ({
  isModalOpen,
  handleOk,
  handleCancel,
  loading,
  text,
}) => {
  return (
    <Modal
      title="Attention!"
      closable={{ "aria-label": "Custom Close Button" }}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      loading={loading}
    >
      <p>{text}</p>
    </Modal>
  );
};

export default ModalConfirmation;
