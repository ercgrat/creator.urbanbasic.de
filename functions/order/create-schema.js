#!/usr/bin/env node

/* bootstrap database in your FaunaDB account - use with `netlify dev:exec <path-to-this-file>` */
const faunadb = require('faunadb')

const q = faunadb.query

function createFaunaDB() {
  if (!process.env.FAUNA_DB_SECRET) {
    console.log('No FAUNA_DB_SECRET in environment, skipping DB setup')
  }
  console.log('Create the database!')
  const client = new faunadb.Client({
    secret: process.env.FAUNA_DB_SECRET,
  })

  /* Based on your requirements, change the schema here */
  return client
    .query(q.Create(q.Ref('classes'), { name: 'items' }))
    .then(() => {
      console.log('Created items class')
      return client.query(
        q.Create(q.Ref('indexes'), {
          name: 'all_items',
          source: q.Ref('classes/items'),
          active: true,
        })
      )
    })

    .catch(error => {
      if (error.requestResult.statusCode === 400 && error.message === 'instance not unique') {
        console.log('DB already exists')
      }
      throw error
    })
}

createFaunaDB()
