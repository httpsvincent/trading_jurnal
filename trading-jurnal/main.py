import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2

app = FastAPI()

def conn():
    return psycopg2.connect(
        host=os.environ["DB_HOST"], dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"], password=os.environ["DB_PASSWORD"])

@app.on_event("startup")
def init():
    with conn() as c, c.cursor() as cur:
        cur.execute("""CREATE TABLE IF NOT EXISTS trades(
            id SERIAL PRIMARY KEY, pair TEXT, side TEXT,
            lot NUMERIC, entry NUMERIC, exit NUMERIC)""")

class Trade(BaseModel):
    pair: str; side: str; lot: float; entry: float; exit: float

@app.get("/health")
def health(): return {"status": "ok"}

@app.get("/trades")
def list_trades():
    with conn() as c, c.cursor() as cur:
        cur.execute("SELECT id,pair,side,lot,entry,exit FROM trades ORDER BY id")
        return [dict(zip(["id","pair","side","lot","entry","exit"], r)) for r in cur.fetchall()]

@app.post("/trades", status_code=201)
def add_trade(t: Trade):
    if t.side not in ("buy", "sell"):
        raise HTTPException(422, "side harus buy/sell")
    with conn() as c, c.cursor() as cur:
        cur.execute("INSERT INTO trades(pair,side,lot,entry,exit) VALUES(%s,%s,%s,%s,%s) RETURNING id",
                    (t.pair, t.side, t.lot, t.entry, t.exit))
        return {"id": cur.fetchone()[0]}