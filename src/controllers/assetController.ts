const assetModel = require("../models/assetModel");
import type { AssetPayload, RequestLike, ResponseLike } from "../types";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro inesperado.";
}

async function getAssets(_req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const assets = await assetModel.getAllAssets();
    return res.status(200).json(assets);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar ativos.",
      details: getErrorMessage(error)
    });
  }
}

async function getAssetById(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const id = Number(req.params.id);
    const asset = await assetModel.getAssetById(id);

    if (!asset) {
      return res.status(404).json({
        message: "Ativo nao encontrado."
      });
    }

    return res.status(200).json(asset);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar ativo.",
      details: getErrorMessage(error)
    });
  }
}

async function createAsset(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const { name, type, status, userId } = req.body as Partial<AssetPayload>;

    if (!name || !type || !status) {
      return res.status(400).json({
        message: "Os campos name, type e status sao obrigatorios."
      });
    }

    const asset = await assetModel.createAsset({ name, type, status, userId: userId || null });
    return res.status(201).json(asset);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar ativo.",
      details: getErrorMessage(error)
    });
  }
}

async function updateAsset(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const id = Number(req.params.id);
    const { name, type, status, userId } = req.body as Partial<AssetPayload>;

    if (!name || !type || !status) {
      return res.status(400).json({
        message: "Os campos name, type e status sao obrigatorios."
      });
    }

    const updatedAsset = await assetModel.updateAsset(id, {
      name,
      type,
      status,
      userId: userId || null
    });

    if (!updatedAsset) {
      return res.status(404).json({
        message: "Ativo nao encontrado."
      });
    }

    return res.status(200).json(updatedAsset);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar ativo.",
      details: getErrorMessage(error)
    });
  }
}

async function deleteAsset(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const id = Number(req.params.id);
    const deletedAsset = await assetModel.deleteAsset(id);

    if (!deletedAsset) {
      return res.status(404).json({
        message: "Ativo nao encontrado."
      });
    }

    return res.status(200).json({
      message: "Ativo removido com sucesso.",
      asset: deletedAsset
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao remover ativo.",
      details: getErrorMessage(error)
    });
  }
}

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset
};
