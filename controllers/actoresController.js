//const fs = require('fs')
const Joi = require('joi')
const { Actor, Contenido } = require('../models');

// Esquema de validación con Joi
const actorSchema = Joi.object({
    nombre: Joi.string().max(100).required()
})
// Esquema de validación para actualizar campos parcialmente
const partialActorSchema = Joi.object({
    nombre: Joi.string().max(100)
})

// Obtener todos los actores
const getAllActors = async (req, res) => {
    try {
        const actors = await Actor.findAll()
        res.status(200).json(actors)
    } catch (error) {
        res.status(500).json({ error: 'No se pudieron traer los actores' })
    }
}

// Obtener un actor por ID con validación de ID y sus contenidos.
const getByIdActorContenido = async (req, res) => {

    const { actorId } = req.params
    try {
      const actor = await Actor.findByPk(actorId,
        {
          include: {
            model: Contenido
          }
        }
      )
      res.status(201).json(actor)
    } catch (error) {
      res.status(500).send({ error: 'no se pudo crear la peli' })
    }
  }
  
// Obtener un actor por ID con validación de ID
const getByIdActor = async (req, res) => {
    const { id } = req.params

    // Validar que el ID sea un número entero positivo
    if (!Number.isInteger(Number(id)) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' })
    }

    try {
        const actor = await Actor.findByPk(id)
        if (actor) {
            res.status(200).json(actor)
        } else {
            res.status(404).json({ error: 'Actor no encontrado' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el actor' })
    }
}

// Crear un nuevo actor con validación de datos
const createActor = async (req, res) => {
    const { error } = actorSchema.validate(req.body)
    if (error) {
        return res.status(400).json({ error: 'Datos inválidos', details: error.details })
    }

    try {
        const newActor = await Actor.create(req.body)
        res.status(201).json(newActor)
    } catch (error) {
        res.status(400).json({ error: 'Error al crear el actor' })
    }
}

// Crear varios actores en una sola operación, con validación de cada elemento en el array
const bulkCreateActors = async (req, res) => {
    const actors = req.body
    if (!Array.isArray(actors) || !actors.length) {
        return res.status(400).json({ error: 'Formato de datos incorrecto, debe ser un array de actores' })
    }

    const invalidActors = actors.filter(actor => actorSchema.validate(actor).error)
    if (invalidActors.length) {
        return res.status(400).json({ error: 'Algunos actores no cumplen con la estructura' })
    }

    try {
        const createdActors = await Actor.bulkCreate(actors)
        res.status(201).json(createdActors)
    } catch (error) {
        res.status(500).json({ error: 'No se pudieron crear los actores' })
    }
}

// Actualizar un actor por ID con validación de ID y datos
const updateActor = async (req, res) => {
    const { id } = req.params
    if (!Number.isInteger(Number(id)) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' })
    }

    const { error } = actorSchema.validate(req.body)
    if (error) {
        return res.status(400).json({ error: 'Datos inválidos', details: error.details })
    }

    try {
        const [updatedRows] = await Actor.update(req.body, { where: { id } })
        if (updatedRows) {
            res.status(200).json({ message: 'Actor actualizado correctamente' })
        } else {
            res.status(404).json({ error: 'Actor no encontrado' })
        }
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar el actor' })
    }
}

// Actualización parcial de un actor por ID
const patchActor = async (req, res) => {
    const { id } = req.params
    if (!Number.isInteger(Number(id)) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' })
    }

    const { error } = partialActorSchema.validate(req.body)
    if (error) {
        return res.status(400).json({ error: 'Datos inválidos para la actualización parcial', details: error.details })
    }

    try {
        const [updatedRows] = await Actor.update(req.body, { where: { id } })
        if (updatedRows) {
            res.status(200).json({ message: 'Actor actualizado parcialmente' })
        } else {
            res.status(404).json({ error: 'Actor no encontrado' })
        }
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar el actor' })
    }
}

// Eliminar un actor por ID con validación de ID
const deleteActor = async (req, res) => {
    const { id } = req.params
    if (!Number.isInteger(Number(id)) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' })
    }

    try {
        const deletedRows = await Actor.destroy({ where: { id } })
        if (deletedRows) {
            res.status(200).json({ message: 'Actor eliminado correctamente' })
        } else {
            res.status(404).json({ error: 'Actor no encontrado' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el actor' })
    }
}
module.exports = {
    getAllActors,
    getByIdActor,
    getByIdActorContenido,
    createActor,
    bulkCreateActors,
    updateActor,
    patchActor,
    deleteActor
}