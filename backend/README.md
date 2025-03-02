# Back End (TypeScript)

## Database Setup (Local)
1. Run `mongodb` then connect to the `localhost` database using MongoDB Compass
2. If not already created, create a database under `localhost` called `get2class`
3. Add collections `users` and `schedules`

## How To Run Back End
1. `cd backend`
2. If you don't already have one, create a .env file
   - Add `DB_URI`, for the value of this refer to the [Notes on Docker](#notes-on-docker) section
   - Add `PORT=3000`
3. If you don't already have all the packages necessary to run the back end, just run `npm i`
4. Run `npx ts-node index.ts`
   - Note that if this command does not work, try `npm run dev`

## Notes on Docker <a name="notes-on-docker"></a>
- For the .env file, if you are running back end just on the local machine, then switch .env to use `DB_URI=mongodb://localhost:27017`
- For the .env file, if you are running back end on local docker container, then switch .env to use `DB_URI=mongodb://mongo:27017`