/**
 * Prompt Service for AI Image Generation
 * Generates contextual prompts based on user, pet, place, and card information
 */

const openaiService = require("./openaiService");

class PromptService {
  /**
   * Generate prompt for reward card image (now async)
   * @returns {Promise<string>} - Generated prompt for AI image generation
   */
  async generateCardPrompt(user, place, contributionType, userPets = [], reviewData = null) {
    // Get pet information, which may involve an async call to the vision API
    const petInfo = await this.getPetInfo(userPets);

    // Get place context
    const placeContext = this.getPlaceContext(place);

    // Get contribution context
    const contributionContext = this.getContributionContext(contributionType);

    // Get review context if available
    const reviewContext = this.getReviewContext(reviewData);

    // Generate the prompt
    const prompt = this.buildPrompt({
      petInfo,
      placeContext,
      contributionContext,
      reviewContext,
      userName: user.name,
    });

    console.log("🎨 Generated prompt for card:", prompt);
    return prompt;
  }

  /**
   * Extract pet information for prompt (now async)
   * @returns {Promise<string>} - Pet description string
   */
  async getPetInfo(userPets) {
    let selectedPet = null;
    let description = "";

    // Prioritize the user's first pet if available
    if (userPets && userPets.length > 0) {
      selectedPet = userPets[0];
    }

    // Attempt to get a description from the pet's profile image using the vision API
    if (selectedPet && selectedPet.profileImage) {
      console.log(`📸 Found profile image for ${selectedPet.name}. Describing with vision API...`);
      const visionDescription = await openaiService.describeImage(selectedPet.profileImage);
      // Use the vision description only if it's not the generic fallback
      if (visionDescription && visionDescription !== "a lovely pet") {
        console.log(`✅ Using AI-generated description: "${visionDescription}"`);
        return visionDescription;
      }
      console.log("🤔 Vision API returned a generic description. Falling back to profile data.");
    }

    // Fallback 1: Use a default pet if no user pet is available
    if (!selectedPet) {
      const defaultPets = [
        { species: "dog", breed: "Golden Retriever", personalityTraits: ["friendly", "playful"], color: "golden" },
        { species: "cat", breed: "Tabby", personalityTraits: ["curious", "independent"], color: "orange" },
        {
          species: "dog",
          breed: "Shiba Inu",
          personalityTraits: ["energetic", "loyal"],
          color: "white",
          accessories: "a blue scarf",
        },
        {
          species: "dog",
          breed: "Poodle",
          personalityTraits: ["elegant", "smart"],
          color: "brown",
          accessories: "a red collar",
        },
      ];
      selectedPet = defaultPets[Math.floor(Math.random() * defaultPets.length)];
      console.log(`🎲 No user pet found. Using default pet: ${selectedPet.breed}`);
    }

    // Fallback 2: Build the description string from the pet's structured profile data
    console.log(`📝 Building description from pet profile data for: ${selectedPet.breed}`);
    description = `a ${selectedPet.size || "medium-sized"} ${selectedPet.color || ""} ${selectedPet.breed}`
      .replace(/  +/g, " ")
      .trim();
    if (selectedPet.accessories) {
      description += ` wearing ${selectedPet.accessories}`;
    }

    return description;
  }

  /**
   * Get physical traits based on breed and species
   * @param {Object} pet - Pet object
   * @returns {Object} - Physical traits object
   */
  getPhysicalTraits(pet) {
    const breedTraits = {
      // Dogs
      "Golden Retriever": { size: "large", coat: "long golden", build: "athletic" },
      Labrador: { size: "large", coat: "short", build: "muscular" },
      "Shiba Inu": { size: "medium", coat: "fluffy", build: "compact" },
      Corgi: { size: "small", coat: "short", build: "short-legged" },
      Husky: { size: "large", coat: "thick fluffy", build: "athletic" },
      Poodle: { size: "medium", coat: "curly", build: "elegant" },
      Bulldog: { size: "medium", coat: "short", build: "stocky" },
      "Border Collie": { size: "medium", coat: "medium length", build: "agile" },

      // Cats
      "British Shorthair": { size: "medium", coat: "short dense", build: "robust" },
      "Maine Coon": { size: "large", coat: "long fluffy", build: "muscular" },
      Persian: { size: "medium", coat: "long silky", build: "compact" },
      Siamese: { size: "medium", coat: "short", build: "slender" },
      Ragdoll: { size: "large", coat: "semi-long", build: "large-boned" },
      "Scottish Fold": { size: "medium", coat: "short", build: "rounded" },
      Tabby: { size: "medium", coat: "striped", build: "average" },
    };

    const defaultTraits =
      pet.species === "cat"
        ? { size: "medium", coat: "short", build: "average" }
        : { size: "medium", coat: "short", build: "average" };

    return breedTraits[pet.breed] || defaultTraits;
  }

  /**
   * Get age category from birth date
   * @param {Date} birthDate - Pet's birth date
   * @returns {string} - Age category
   */
  getAgeCategory(birthDate) {
    if (!birthDate) return "adult";

    const age = (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365);

    if (age < 1) return "puppy/kitten";
    if (age < 3) return "young";
    if (age < 7) return "adult";
    return "senior";
  }

  /**
   * Get place context for prompt
   * @param {Object} place - Place information
   * @returns {Object} - Place context object
   */
  getPlaceContext(place) {
    const placeType = place?.type?.toLowerCase() || "dog park";
    console.log(`📍 Generating context for place type: "${placeType}"`);

    const placeContexts = {
      "dog park": [
        "a dog park with trees and frisbees",
        "a sunny field where dogs are playing fetch",
        "a park with happy dogs running on green grass",
      ],
      vet: [
        "an animal clinic with a friendly vet",
        "a clean and modern veterinary office",
        "a calm waiting room at the vet's",
      ],
      "pet store": [
        "a pet store with colorful treat shelves",
        "a cozy indoor grooming salon",
        "a store filled with aisles of pet toys and food",
        "a bright and cheerful pet supply shop",
      ],
      shelter: [
        "a welcoming animal shelter with cozy kennels",
        "an adoption event at a local animal shelter",
        "a shelter where volunteers are playing with pets",
        "a hopeful place where pets wait for their new families",
      ],
    };

    // Find the first key in placeContexts that is included in the placeType string
    const matchedKey = Object.keys(placeContexts).find((key) => placeType.includes(key.replace("_", " ")));

    let options;
    if (matchedKey && placeContexts[matchedKey]) {
      options = placeContexts[matchedKey];
    } else {
      // Fallback to the default if no match is found
      options = placeContexts["dog park"];
    }

    // Return a random description from the selected options
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get contribution context for prompt
   * @param {string} contributionType - Type of contribution
   * @returns {Object} - Contribution context object
   */
  getContributionContext(contributionType) {
    const contexts = {
      first_review: {
        mood: "excited and curious",
        action: "exploring for the first time",
        celebration: "first adventure",
        emoji: "🎉",
      },
      milestone_achievement: {
        mood: "proud and accomplished",
        action: "celebrating achievement",
        celebration: "milestone reached",
        emoji: "🏆",
      },
      community_approval: {
        mood: "happy and appreciated",
        action: "being loved by the community",
        celebration: "community favorite",
        emoji: "👍",
      },
    };

    return contexts[contributionType] || contexts["first_review"];
  }

  /**
   * Get review context for additional prompt details
   * @param {Object} reviewData - Review data
   * @returns {Object} - Review context object
   */
  getReviewContext(reviewData) {
    if (!reviewData) return null;

    const context = {
      rating: reviewData.rating || 5,
      hasPhotos: reviewData.photos && reviewData.photos.length > 0,
      tags: reviewData.tags || [],
    };

    // Add mood based on rating
    if (context.rating >= 4) {
      context.mood = "very happy";
    } else if (context.rating >= 3) {
      context.mood = "content";
    } else {
      context.mood = "neutral";
    }

    return context;
  }

  /**
   * Build the final prompt
   * @param {Object} components - All prompt components
   * @returns {string} - Final prompt
   */
  buildPrompt(components) {
    const { petInfo, placeContext, contributionContext, reviewContext, userName } = components;

    // The base style is now the main template
    let prompt =
      "A flat, vintage-style cartoon illustration showing [pet_description] at [place_description]. The pet looks happy and playful. The scene is warm, friendly, and colorful, drawn in a retro children’s picture book style. Use soft, earthy colors, thick outlines, and simple shapes.";

    // Replace placeholders with dynamic content
    prompt = prompt.replace("[pet_description]", petInfo);
    prompt = prompt.replace("[place_description]", placeContext);

    console.log("🎨 Final generated prompt:", prompt);
    return prompt;
  }

  /**
   * Generate a simpler prompt for testing
   * @param {string} petSpecies - Pet species
   * @param {string} placeType - Place type
   * @returns {string} - Simple test prompt
   */
  generateTestPrompt(petSpecies = "dog", placeType = "dog park") {
    const petInfo = this.getPetInfo([]);
    const placeContext = this.getPlaceContext({ type: placeType });
    const contributionContext = this.getContributionContext("first_review");

    return this.buildPrompt({
      petInfo: { ...petInfo, species: petSpecies },
      placeContext,
      contributionContext,
      reviewContext: null,
      userName: "Test User",
    });
  }
}

module.exports = new PromptService();
