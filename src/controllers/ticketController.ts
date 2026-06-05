const ticketModel = require("../models/ticketModel");
import type { TicketPayload, RequestLike, ResponseLike } from "../types";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro inesperado.";
}

async function getTickets(_req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const tickets = await ticketModel.getAllTickets();
    return res.status(200).json(tickets);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar chamados.",
      details: getErrorMessage(error)
    });
  }
}

async function getTicketById(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const id = Number(req.params.id);
    const ticket = await ticketModel.getTicketById(id);

    if (!ticket) {
      return res.status(404).json({
        message: "Chamado nao encontrado."
      });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar chamado.",
      details: getErrorMessage(error)
    });
  }
}

async function createTicket(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const { title, description, status, assetId } = req.body as Partial<TicketPayload>;

    if (!title || !description || !status) {
      return res.status(400).json({
        message: "Os campos title, description e status sao obrigatorios."
      });
    }

    const ticket = await ticketModel.createTicket({ title, description, status, assetId: assetId || null });
    return res.status(201).json(ticket);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar chamado.",
      details: getErrorMessage(error)
    });
  }
}

async function updateTicket(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const id = Number(req.params.id);
    const { title, description, status, assetId } = req.body as Partial<TicketPayload>;

    if (!title || !description || !status) {
      return res.status(400).json({
        message: "Os campos title, description e status sao obrigatorios."
      });
    }

    const updatedTicket = await ticketModel.updateTicket(id, {
      title,
      description,
      status,
      assetId: assetId || null
    });

    if (!updatedTicket) {
      return res.status(404).json({
        message: "Chamado nao encontrado."
      });
    }

    return res.status(200).json(updatedTicket);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar chamado.",
      details: getErrorMessage(error)
    });
  }
}

async function deleteTicket(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const id = Number(req.params.id);
    const deletedTicket = await ticketModel.deleteTicket(id);

    if (!deletedTicket) {
      return res.status(404).json({
        message: "Chamado nao encontrado."
      });
    }

    return res.status(200).json({
      message: "Chamado removido com sucesso.",
      ticket: deletedTicket
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao remover chamado.",
      details: getErrorMessage(error)
    });
  }
}

async function updateTicketStatus(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "O campo status e obrigatorio."
      });
    }

    const updatedTicket = await ticketModel.updateTicket(id, { status });

    if (!updatedTicket) {
      return res.status(404).json({
        message: "Chamado nao encontrado."
      });
    }

    return res.status(200).json(updatedTicket);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar status do chamado.",
      details: getErrorMessage(error)
    });
  }
}

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  updateTicketStatus
};
