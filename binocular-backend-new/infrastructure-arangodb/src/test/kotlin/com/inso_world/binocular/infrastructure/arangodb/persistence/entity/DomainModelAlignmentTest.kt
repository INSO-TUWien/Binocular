package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Build
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.File
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.Job
import com.inso_world.binocular.model.Mention
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Milestone
import com.inso_world.binocular.model.Note
import com.inso_world.binocular.model.Platform
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.Stats
import com.inso_world.binocular.model.User
import com.inso_world.binocular.model.vcs.ReferenceCategory
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.test.util.AssertionErrors.fail
import java.lang.reflect.ParameterizedType
import kotlin.collections.Map

// Test to ensure that the persistence entity classes align with the domain model classes
// Tests should fail if there are mismatches in property types or relations
// and warn if there are extra properties or relations
@Disabled("Refactored in domain model #454")
class DomainModelAlignmentTest {
    // Mapped pairs are based of off mappers
    private val mappedClasses =
        mapOf(
            Account::class.java to AccountEntity::class.java,
            Branch::class.java to BranchEntity::class.java,
            Build::class.java to BuildEntity::class.java,
            Commit::class.java to CommitEntity::class.java,
            File::class.java to FileEntity::class.java,
            Issue::class.java to IssueEntity::class.java,
            Job::class.java to JobEntity::class.java,
            Mention::class.java to MentionEntity::class.java,
            MergeRequest::class.java to MergeRequestEntity::class.java,
            Milestone::class.java to MilestoneEntity::class.java,
            Module::class.java to ModuleEntity::class.java,
            Note::class.java to NoteEntity::class.java,
            Platform::class.java to PlatformEntity::class.java,
            Stats::class.java to StatsEntity::class.java,
            User::class.java to UserEntity::class.java,
            Developer::class.java to DeveloperEntity::class.java,
            Repository::class.java to RepositoryEntity::class.java,
            ReferenceCategory::class.java to String::class.java,
            Project::class.java to ProjectEntity::class.java,
        )

    companion object {
        @JvmStatic
        fun entityModelPairs() =
            listOf(
                Arguments.of(Account::class.java, AccountEntity::class.java),
                Arguments.of(Branch::class.java, BranchEntity::class.java),
                Arguments.of(Build::class.java, BuildEntity::class.java),
                Arguments.of(Commit::class.java, CommitEntity::class.java),
                Arguments.of(File::class.java, FileEntity::class.java),
                Arguments.of(Issue::class.java, IssueEntity::class.java),
                Arguments.of(Job::class.java, JobEntity::class.java),
                Arguments.of(Mention::class.java, MentionEntity::class.java),
                Arguments.of(MergeRequest::class.java, MergeRequestEntity::class.java),
                Arguments.of(Milestone::class.java, MilestoneEntity::class.java),
                Arguments.of(com.inso_world.binocular.model.Module::class.java, ModuleEntity::class.java),
                Arguments.of(Note::class.java, NoteEntity::class.java),
                Arguments.of(Stats::class.java, StatsEntity::class.java),
                Arguments.of(User::class.java, UserEntity::class.java),
                Arguments.of(Developer::class.java, DeveloperEntity::class.java),
                Arguments.of(Repository::class.java, RepositoryEntity::class.java),
                Arguments.of(ReferenceCategory::class.java, String::class.java),
                Arguments.of(Project::class.java, ProjectEntity::class.java),
            )
    }

    @ParameterizedTest
    @MethodSource("entityModelPairs")
    fun `compare entity and model alignment`(
        model: Class<*>,
        entity: Class<*>
    ) {
        var internalModelProperties = emptySet<String>()
        var allowedTypePairs = emptyMap<Class<out Any>, Class<out Any>>()
        var mappedProperties = emptyMap<String, String>()
        var deprecatedProperties = emptySet<String>()

        // handle special cases per model entity pair if applicable
        // TODO: spacial cases better defined in companion object?
        if (model == Issue::class.java) {
            allowedTypePairs =
                mapOf(
                    java.time.LocalDateTime::class.java to java.util.Date::class.java
                )
        }
        if (model == Commit::class.java) {
            internalModelProperties = setOf("_parents", "_children", "_branches")

            mappedProperties =
                mapOf(
                    "commitDateTime" to "date"
                )

            allowedTypePairs =
                mapOf(
                    java.time.LocalDateTime::class.java to java.util.Date::class.java,
                    java.util.Set::class.java to java.util.List::class.java
                )

            deprecatedProperties =
                setOf(
                    "branch"
                )
        }
        if (model == User::class.java) {
            internalModelProperties = setOf("_committedCommits", "_authoredCommits")
        }
        if (model == Branch::class.java) {
            internalModelProperties = setOf("_commits")
            mappedProperties =
                mapOf(
                    "name" to "branch"
                )
            deprecatedProperties =
                setOf(
                    "branch"
                )
        }
        if (model == Build::class.java) {
            allowedTypePairs =
                mapOf(
                    java.time.LocalDateTime::class.java to java.util.Date::class.java
                )
        }
        if (model == Job::class.java) {
            allowedTypePairs =
                mapOf(
                    java.time.LocalDateTime::class.java to java.util.Date::class.java
                )
        }
        if (model == Mention::class.java) {
            allowedTypePairs =
                mapOf(
                    java.time.LocalDateTime::class.java to java.util.Date::class.java
                )
        }

        // perform test
        `compare raw entity and model properties`(
            entity,
            model,
            internalModelProperties,
            allowedTypePairs,
            mappedProperties,
            deprecatedProperties
        )

        `compare entity and model edges`(entity, model)
    }

    // Generic method to compare properties of given entity and model classes
    // internalModelProperties: properties that should be ignored in the comparison because they are internal to the model
    // allowedTypePairs: map of model types to entity types that are considered equivalent
    // mappedProperties: map of model property names to entity property names based on mapping rules
    fun `compare raw entity and model properties`(
        entity: Class<*>,
        model: Class<*>,
        internalModelProperties: Set<String>,
        allowedTypePairs: Map<Class<out Any>, Class<out Any>>,
        mappedProperties: Map<String, String>,
        deprecatedProperties: Set<String>
    ) {
        val entityProps =
            entity.declaredFields
                .associate { it.name to it.type }
        val modelProps =
            model.declaredFields
                .associate { it.name to it.type }

        // check for matching type or allowed equivalence
        modelProps.forEach { (name, modelType) ->
            val entityPropertyName = mappedProperties[name] ?: name
            val entityType = entityProps[entityPropertyName]

            if (deprecatedProperties.contains(name)) {
                // if a property is deprecated check for its existence in the entity and mapping status
                if (entityType != null) {
                    if (!mappedProperties.values.contains(entityPropertyName)) {
                        println("️⚠️ Property '$name' in ${model.simpleName} is deprecated but still exists in ${entity.simpleName}.")
                    } else {
                        var key: String = ""
                        mappedProperties.forEach { pair ->
                            if (pair.value == entityPropertyName) key = pair.key
                        }
                        println("️⚠️ Property '$name' in ${model.simpleName} is deprecated but replaced by property '$key.'")
                    }
                } else {
                    println("️⚠️ Property '$name' in ${model.simpleName} is deprecated but does not exist in ${entity.simpleName}.")
                }
                return@forEach
            }

            if (entityType == null && name !in internalModelProperties) {
                println("⚠️ ${model.simpleName} has extra field '$name' (model type: $modelType)")
                return@forEach
            }

            val isAllowedMismatch = (allowedTypePairs[modelType] == entityType) || (mappedClasses[modelType] == entityType)
            if (entityType != modelType && !isAllowedMismatch) {
                fail(
                    "❌ Property '$name' type mismatch between ${model.simpleName} and ${entity.simpleName}: expected $modelType but got $entityType"
                )
            }
        }

        // check that entity has extra fields that are not in model
        val extraFields = entityProps.keys - modelProps.keys
        for (extraField in extraFields) {
            val entityType = entityProps[extraField]
            if (extraField !in mappedProperties.values) {
                println("️⚠️ ${entity.simpleName} has extra field not in model: $extraField (type: $entityType)")
            }
        }
    }

    fun `compare entity and model edges`(
        entity: Class<*>,
        model: Class<*>,
    ) {
        val entityRelations =
            entity.declaredFields
                .filter { field ->
                    val type = field.genericType
                    val isRelevant =
                        (
                            !(type is Class<*> && type.isPrimitive) &&
                                type != String::class.java &&
                                type != java.util.Date::class.java
                        ) &&
                            !(field.name.contains("_"))
                    isRelevant
                }.map { field -> field.name to field.genericType }
                .toSet()

        // find all fields that don't have primitive or LocalDateTime type in commit model or have names containing"_"
        // and save their names and generic type in modelRelations
        val modelRelations =
            model.declaredFields
                .filter { field ->
                    val type = field.genericType
                    val isRelevant =
                        (
                            !(type is Class<*> && type.isPrimitive) &&
                                type != String::class.java &&
                                type != java.time.LocalDateTime::class.java
                        ) &&
                            !(field.name.contains("_"))
                    isRelevant
                }.map { field -> field.name to field.genericType }
                .toSet()

        // check that all model relations exist in entity relations with correct mapped types
        modelRelations.forEach { (name, modelType) ->
            val entityRelation = entityRelations.find { it.first == name }
            if (entityRelation == null) {
                // if relation does not exist, warn but do not fail
                println("⚠️ ${model.simpleName} has extra relation (edge) through field $name to model class : $modelType.")
            }

            if (modelType is ParameterizedType && entityRelation is ParameterizedType) {
                val modelRaw = modelType.rawType as Class<*>
                val entityRaw = entityRelation.rawType as Class<*>
                val modelParam = modelType.actualTypeArguments.firstOrNull() as? Class<*>
                val entityParam = entityRelation.actualTypeArguments.firstOrNull() as? Class<*>

                // check if raw types match (List<> mapps to Set<> and vice versa)
                val rawMatch = (modelRaw == entityRaw) || (modelRaw == Set::class.java && entityRaw == List::class.java)
                // check if parameter type matches based on mapping (e.g. Issue → IssueEntity)
                val paramMatch = (mappedClasses[modelParam] == entityParam) || modelParam == entityParam

                if (!rawMatch || !paramMatch) {
                    fail(
                        "❌ Edge '$name' mismatch between ${model.simpleName} and ${entity.simpleName}: expected $modelRaw<$modelParam> but got $entityRaw<$entityParam>"
                    )
                }
            } else if (modelType is Class<*> && entityRelation is Class<*>) {
                val mappedExpected = mappedClasses[modelType]
                if (entityRelation != mappedExpected && entityRelation != modelType) {
                    fail(
                        "❌ Edge '$name' mismatch between ${model.simpleName} and ${entity.simpleName}: expected ${mappedExpected ?: modelType} but got $entityRelation"
                    )
                }
            }
        }

        // check if entity has extra relations that are not in model
        val extraRelations = entityRelations.map { it.first }.toSet() - modelRelations.map { it.first }.toSet()
        if (extraRelations.isNotEmpty()) {
            for (extraRelation in extraRelations) {
                println(
                    "⚠️ ${entity.simpleName} has extra relation (edge) through field $extraRelation to entity class : ${entityRelations.find {
                        it.first == extraRelation
                    }?.second}."
                )
            }
        }
    }
}
