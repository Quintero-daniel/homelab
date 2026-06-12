CREATE TABLE recipes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    rating      SMALLINT CHECK (rating >= 0 AND rating <= 5),
    picture_url VARCHAR(500)
);

CREATE TABLE ingredients (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE recipe_ingredients (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id     UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    quantity      NUMERIC(10, 2),
    unit          VARCHAR(50),
    notes         VARCHAR(255)
);

CREATE TABLE nutritional_factors (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE recipe_nutritional_factors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id           UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    nutritional_factor_id UUID NOT NULL REFERENCES nutritional_factors(id),
    amount              NUMERIC(10, 2) NOT NULL,
    unit                VARCHAR(50) NOT NULL
);

CREATE TABLE directions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id   UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    step_number SMALLINT NOT NULL,
    description TEXT NOT NULL
);
