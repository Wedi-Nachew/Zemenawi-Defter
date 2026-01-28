const setCreatedAt = (model) => {
    const now = Date.now();
    model.createdAt = now;
    model.updatedAt = now;
};

const setUpdatedAt = (model) => {
    model.updatedAt = Date.now();
};

export { setCreatedAt, setUpdatedAt };
