import { MongoClient, ServerApiVersion } from 'mongodb';
import fetch from 'node-fetch';

const uri = "mongodb+srv://root:<yourPassword>@cluster0.lo8dg.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function fetchData(url) {
    const response = await fetch(url);
    return response.json();
}

async function run() {
    try {
        await client.connect();

        const database = client.db("pokemon"); // 
        const pokemonCollection = database.collection("Pokemon");
        const speciesCollection = database.collection("Species");


        const pokemonListUrl = "https://pokeapi.co/api/v2/pokemon/?limit=151";
        const pokemonListData = await fetchData(pokemonListUrl);

        for (const pokemon of pokemonListData.results) {
            // Obtener información de cada Pokémon
            const pokemonData = await fetchData(pokemon.url);

            // Insertar en la colección "Pokemon"
            await pokemonCollection.insertOne(pokemonData);

            // Insertar en la colección "Species"
            const speciesUrl = pokemonData.species.url;
            const speciesData = await fetchData(speciesUrl);
            await speciesCollection.insertOne(speciesData);
        }

        console.log("Datos insertados correctamente en las colecciones Pokemon y Species.");
    } finally {
        await client.close();
    }
}

run().catch(console.error);
