CREATE UNLOGGED TABLE clients ( 
  id SERIAL PRIMARY KEY, 
  money_limit INTEGER NOT NULL, 
  balance INTEGER NOT NULL
);

CREATE UNLOGGED TABLE transactions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  operation_type CHAR(1) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo', now()),
  FOREIGN KEY (client_id) REFERENCES clients (id)
);

CREATE INDEX idx_transactions_client_id ON transactions (client_id);
CREATE INDEX idx_transactions_client_id_created_at ON transactions(client_id, created_at);
CREATE INDEX idx_clients_balance ON clients(balance);
CREATE INDEX idx_clients_money_limit ON clients(money_limit);

DO $$
BEGIN
  INSERT INTO clients (money_limit, balance)
  VALUES
    (100000, 0),
    (80000, 0),
    (1000000, 0),
    (10000000, 0),
    (500000, 0);
END; $$

