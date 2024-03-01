export const transactionSchema = {
  body: {
    type: "object",
    properties: {
      tipo: { type: "string", enum: ["c", "d"] },
      valor: { type: "integer", minimum: 1 },
      descricao: { type: "string", maxLength: 10, minLength: 1 },
    },
    required: ["tipo", "valor", "descricao"],
  },
  params: {
    type: "object",
    properties: {
      id: {
        type: "integer",
      },
    },
    required: ["id"],
  },
};

export const extractSchema = {
  schema: {
    params: {
      type: "object",
      properties: {
        id: {
          type: "integer",
        },
      },
    },
  },
};
