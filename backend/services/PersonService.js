const PersonRepository = require('../repositories/PersonRepository');
const { createPersonSchema, updatePersonSchema } = require('../models/Person');

/**
 * Service class for Person business logic operations
 */
class PersonService {
    constructor() {
        this.personRepository = new PersonRepository();
    }

    /**
     * Get all persons
     * @returns {Promise<Array>} Array of person objects
     */
    async getAllPersons() {
        return await this.personRepository.findAll();
    }

    /**
     * Get person by ID
     * @param {number} id - Person ID
     * @returns {Promise<Object>} Person object
     * @throws {Error} If person not found
     */
    async getPersonById(id) {
        const person = await this.personRepository.findById(id);
        if (!person) {
            throw new Error(`Persona con ID ${id} no encontrada`);
        }
        return person;
    }

    /**
     * Create a new person with business validations
     * @param {Object} personData - Person data
     * @param {string} personData.name - Person name
     * @returns {Promise<Object>} Created person object
     * @throws {Error} If validation fails or name already exists
     */
    async createPerson(personData) {
        // Validate input data
        const { error, value } = createPersonSchema.validate(personData);
        if (error) {
            throw new Error(`Datos inválidos: ${error.details[0].message}`);
        }

        const { name } = value;

        // Business rule: Check if name already exists
        console.log('Checking if person exists with name:', name); // Debug log
        const existingPerson = await this.personRepository.findByName(name);
        console.log('Existing person found:', existingPerson); // Debug log

        if (existingPerson) {
            throw new Error(`Ya existe una persona con el nombre "${name}"`);
        }

        // Create the person
        console.log('Creating person with name:', name); // Debug log
        return await this.personRepository.create({ name });
    }

    /**
     * Update an existing person with business validations
     * @param {number} id - Person ID
     * @param {Object} personData - Updated person data
     * @param {string} personData.name - Updated person name
     * @returns {Promise<Object>} Updated person object
     * @throws {Error} If validation fails, person not found, or name already exists
     */
    async updatePerson(id, personData) {
        // Validate input data
        const { error, value } = updatePersonSchema.validate(personData);
        if (error) {
            throw new Error(`Datos inválidos: ${error.details[0].message}`);
        }

        const { name } = value;

        // Check if person exists
        const existingPerson = await this.personRepository.findById(id);
        if (!existingPerson) {
            throw new Error(`Persona con ID ${id} no encontrada`);
        }

        // Business rule: Check if new name already exists (excluding current person)
        const nameExists = await this.personRepository.nameExists(name, id);
        if (nameExists) {
            throw new Error(`Ya existe otra persona con el nombre "${name}"`);
        }

        // Update the person
        const updatedPerson = await this.personRepository.update(id, { name });
        if (!updatedPerson) {
            throw new Error(`Error al actualizar la persona con ID ${id}`);
        }

        return updatedPerson;
    }

    /**
     * Delete a person with business validations
     * @param {number} id - Person ID
     * @returns {Promise<boolean>} True if person was deleted
     * @throws {Error} If person not found or has assignments
     */
    async deletePerson(id) {
        // Check if person exists
        const existingPerson = await this.personRepository.findById(id);
        if (!existingPerson) {
            throw new Error(`Persona con ID ${id} no encontrada`);
        }

        // Business rule: Cannot delete person with assignments
        const hasAssignments = await this.personRepository.hasAssignments(id);
        if (hasAssignments) {
            throw new Error(`No se puede eliminar la persona "${existingPerson.name}" porque tiene asignaciones registradas`);
        }

        // Delete the person
        const deleted = await this.personRepository.delete(id);
        if (!deleted) {
            throw new Error(`Error al eliminar la persona con ID ${id}`);
        }

        return true;
    }

    /**
     * Get person statistics
     * @returns {Promise<Object>} Person statistics
     */
    async getPersonStatistics() {
        const totalCount = await this.personRepository.count();
        return {
            totalPersons: totalCount
        };
    }

    /**
     * Check if a person name is available
     * @param {string} name - Person name to check
     * @param {number} [excludeId] - ID to exclude from the check (for updates)
     * @returns {Promise<boolean>} True if name is available, false if taken
     */
    async isNameAvailable(name, excludeId = null) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return false;
        }

        const exists = await this.personRepository.nameExists(name.trim(), excludeId);
        return !exists;
    }

    /**
     * Search persons by name (partial match)
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} Array of matching person objects
     */
    async searchPersonsByName(searchTerm) {
        if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
            return [];
        }

        // For now, get all persons and filter (could be optimized with database search)
        const allPersons = await this.personRepository.findAll();
        const searchLower = searchTerm.toLowerCase().trim();

        return allPersons.filter(person =>
            person.name.toLowerCase().includes(searchLower)
        );
    }
}

module.exports = PersonService;