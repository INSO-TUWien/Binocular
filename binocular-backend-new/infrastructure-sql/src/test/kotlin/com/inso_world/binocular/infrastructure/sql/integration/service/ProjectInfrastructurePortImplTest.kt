package com.inso_world.binocular.infrastructure.sql.integration.service

import com.inso_world.binocular.core.service.ProjectInfrastructurePort
import com.inso_world.binocular.core.service.RepositoryInfrastructurePort
import com.inso_world.binocular.infrastructure.sql.integration.service.base.BaseServiceTest
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.PageRequest

internal class ProjectInfrastructurePortImplTest : BaseServiceTest() {
    @Autowired
    private lateinit var projectPort: ProjectInfrastructurePort

    @Autowired
    private lateinit var repositoryPort: RepositoryInfrastructurePort

//    @BeforeEach
//    fun setup() {
//        setUp()
//    }

    @AfterEach
    fun cleanup() {
        tearDown()
    }

    @Nested
    @DisplayName("Create Operations")
    inner class CreateOperations {
        @Test
        fun `create project with minimal required fields`() {
            // Given: A project with only required name field
            val project = Project(name = "MinimalProject")

            // When: Creating the project
            val created = projectPort.create(project)

            // Then: Project is created with all expected fields
            assertAll(
                "Verify minimal project creation",
                { assertThat(created.name).isEqualTo("MinimalProject") },
                { assertThat(created.id).isNotNull() },
                { assertThat(created.iid).isNotNull() },
                { assertThat(created.description).isNull() }
            )

            // And: Project can be retrieved
            assertThat(projectPort.findAll()).hasSize(1)
        }

        @Test
        fun `create project with minimal required fields, verify that domain object is returned again`() {
            // Given: A project with only required name field
            val project = Project(name = "MinimalProject")

            // When: Creating the project
            val created = projectPort.create(project)

            // Then: Project is created with all expected fields
            assertAll(
                { assertThat(project).isSameAs(created) },
            )
        }

        @Test
        fun `create project with name and description`() {
            // Given: A project with name and description
            val project =
                Project(name = "DescribedProject").apply {
                    description = "This is a test project with a description"
                }

            // When: Creating the project
            val created = projectPort.create(project)

            // Then: Project is created with description
            assertAll(
                "Verify project with description",
                { assertThat(created.name).isEqualTo("DescribedProject") },
                { assertThat(created.description).isEqualTo("This is a test project with a description") },
                { assertThat(created.id).isNotNull() }
            )
        }

        @Test
        fun `create project with 254 character long description, should succeed`() {
            val longDescription = "a".repeat(254)
            val project =
                Project(name = "LongDescProject").apply {
                    description = longDescription
                }

            // When: Creating the project
            val created = projectPort.create(project)

            // Then: Long description is stored correctly
            assertThat(created.description).isEqualTo(longDescription)
            assertThat(created.description!!.length).isEqualTo(254)
        }

        @Test
        fun `create project with 255 character long description, should succeed`() {
            val longDescription = "a".repeat(255)
            val project =
                Project(name = "LongDescProject").apply {
                    description = longDescription
                }

            // When: Creating the project
            val created = projectPort.create(project)

            // Then: Long description is stored correctly
            assertThat(created.description).isEqualTo(longDescription)
            assertThat(created.description!!.length).isEqualTo(255)
        }

        @Test
        fun `create project with 256 character long description, should fail`() {
            // Given: A project with a very long description (255+ characters)
            val longDescription = "a".repeat(256)
            val project =
                Project(name = "LongDescProject").apply {
                    description = longDescription
                }

            // When: Creating the project
            val ex = assertThrows<IllegalArgumentException> { projectPort.create(project) }

            // Then: Long description is stored correctly
            assertThat(ex.message).isEqualTo("Description must not exceed 255 characters.")
        }

        @Test
        fun `create project with special characters in name`() {
            // Given: A project with special characters in name
            val specialName = "Project-2024_v1.0 (Beta) #123"
            val project = Project(name = specialName)

            // When: Creating the project
            val created = projectPort.create(project)

            // Then: Special characters are preserved
            assertThat(created.name).isEqualTo(specialName)
        }

        @Test
        fun `create project with unicode characters in name`() {
            // Given: A project with unicode/international characters
            val unicodeName = "项目 Проект プロジェクト 🚀"
            val project = Project(name = unicodeName)

            // When: Creating the project
            val created = projectPort.create(project)

            // Then: Unicode characters are preserved
            assertThat(created.name).isEqualTo(unicodeName)
        }

        @Test
        fun `create multiple projects with different names`() {
            // Given: Multiple projects with unique names
            val project1 = Project(name = "Project Alpha")
            val project2 = Project(name = "Project Beta")
            val project3 = Project(name = "Project Gamma")

            // When: Creating all projects
            val created1 = projectPort.create(project1)
            val created2 = projectPort.create(project2)
            val created3 = projectPort.create(project3)

            // Then: All projects are created with unique IDs
            assertAll(
                "Verify multiple project creation",
                { assertThat(projectPort.findAll()).hasSize(3) },
                { assertThat(created1.id).isNotEqualTo(created2.id) },
                { assertThat(created2.id).isNotEqualTo(created3.id) },
                { assertThat(created1.id).isNotEqualTo(created3.id) }
            )
        }

        @Test
        fun `creating project with duplicate name fails fast`() {
            // Given: an existing project with a name
            projectPort.create(Project(name = "Duplicate Project"))

            // When: creating another project with the same name
            val exception =
                assertThrows<IllegalArgumentException> {
                    projectPort.create(Project(name = "Duplicate Project"))
                }

            // Then: creation fails before hitting the database unique constraint
            assertThat(exception.message).isEqualTo("Project with unique key 'Duplicate Project' already exists")
            assertThat(projectPort.findAll()).hasSize(1)
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `create project with repository association`() {
            // Disabled: Project.repo relation removed in refactoring #454
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `create project with issues`() {
            // Disabled: Project.issues relation removed in refactoring #454
        }

        @Test
        fun `create project with empty description`() {
            // Given: A project with empty string description
            val project =
                Project(name = "EmptyDescProject").apply {
                    description = ""
                }

            // When: Creating the project
            val created = projectPort.create(project)

            // Then: Empty description is stored
            assertThat(created.description).isEqualTo("")
        }

        @Test
        fun `create project with null description is allowed`() {
            // Given: A project with null description (default)
            val project = Project(name = "NullDescProject")

            // When: Creating the project
            val created = projectPort.create(project)

            // Then: Description remains null
            assertThat(created.description).isNull()
        }
    }

    @Nested
    @DisplayName("Read Operations")
    inner class ReadOperations {
        @Test
        fun `findAll returns all created projects`() {
            // Given: Multiple projects exist in database
            projectPort.create(Project(name = "Project 1"))
            projectPort.create(Project(name = "Project 2"))
            projectPort.create(Project(name = "Project 3"))

            // When: Finding all projects
            val allProjects = projectPort.findAll()

            // Then: All projects are returned
            assertAll(
                "Verify all projects retrieved",
                { assertThat(allProjects).hasSize(3) },
                {
                    val names = allProjects.map { it.name }
                    assertThat(names).containsExactlyInAnyOrder("Project 1", "Project 2", "Project 3")
                }
            )
        }

        @Test
        fun `findAll returns empty collection when no projects exist`() {
            // Given: No projects in database

            // When: Finding all projects
            val allProjects = projectPort.findAll()

            // Then: Empty collection is returned
            assertThat(allProjects).isEmpty()
        }

        @Test
        fun `findAll with pagination returns correct page`() {
            // Given: 10 projects in database
            repeat(10) { index ->
                projectPort.create(Project(name = "Project ${index + 1}"))
            }

            // When: Finding projects with pagination (page 0, size 3)
            val page = projectPort.findAll(PageRequest.of(0, 3))

            // Then: Correct page is returned
            assertAll(
                "Verify paginated results",
                { assertThat(page.content).hasSize(3) },
                { assertThat(page.totalElements).isEqualTo(10) },
                { assertThat(page.totalPages).isEqualTo(4) },
                { assertThat(page.number).isEqualTo(0) }
            )
        }

        @Test
        fun `findAll with pagination returns second page correctly`() {
            // Given: 10 projects in database
            repeat(10) { index ->
                projectPort.create(Project(name = "Project ${index + 1}"))
            }

            // When: Finding second page (page 1, size 3)
            val page = projectPort.findAll(PageRequest.of(1, 3))

            // Then: Second page is returned
            assertAll(
                "Verify second page",
                { assertThat(page.content).hasSize(3) },
                { assertThat(page.number).isEqualTo(1) },
                { assertThat(page.totalElements).isEqualTo(10) }
            )
        }

        @Test
        fun `findByIid returns correct project`() {
            // Given: A created project
            val created =
                projectPort.create(
                    Project(name = "TargetProject").apply {
                        description = "Find me!"
                    }
                )
            projectPort.create(Project(name = "OtherProject"))

            // When: Finding by iid
            val found = projectPort.findByIid(created.iid)

            // Then: Correct project is returned
            assertAll(
                "Verify found project",
                { assertThat(found).isNotNull },
                { assertThat(found?.name).isEqualTo("TargetProject") },
                { assertThat(found?.description).isEqualTo("Find me!") },
                { assertThat(found?.iid).isEqualTo(created.iid) }
            )
        }

        @Test
        fun `findByIid returns null for non-existent iid`() {
            // Given: Some projects exist
            projectPort.create(Project(name = "ExistingProject"))

            // When: Finding by non-existent iid
            val nonExistentIid = Project.Id(kotlin.uuid.Uuid.random())
            val found = projectPort.findByIid(nonExistentIid)

            // Then: Null is returned
            assertThat(found).isNull()
        }

        @Test
        fun `findByName returns correct project`() {
            // Given: Multiple projects with different names
            projectPort.create(Project(name = "Alpha Project"))
            val target =
                projectPort.create(
                    Project(name = "Beta Project").apply {
                        description = "This is the one"
                    }
                )
            projectPort.create(Project(name = "Gamma Project"))

            // When: Finding by name
            val found = projectPort.findByName("Beta Project")

            // Then: Correct project is returned
            assertAll(
                "Verify found project by name",
                { assertThat(found).isNotNull },
                { assertThat(found?.name).isEqualTo("Beta Project") },
                { assertThat(found?.description).isEqualTo("This is the one") },
                { assertThat(found?.id).isEqualTo(target.id) }
            )
        }

        @Test
        fun `findByName returns null for non-existent name`() {
            // Given: Some projects exist
            projectPort.create(Project(name = "Existing Project"))

            // When: Finding by non-existent name
            val found = projectPort.findByName("Non-Existent Project")

            // Then: Null is returned
            assertThat(found).isNull()
        }

        @Test
        fun `findByName is case-sensitive`() {
            // Given: A project with specific casing
            projectPort.create(Project(name = "MyProject"))

            // When: Finding with different casing
            val foundLowercase = projectPort.findByName("myproject")
            val foundUppercase = projectPort.findByName("MYPROJECT")
            val foundCorrect = projectPort.findByName("MyProject")

            // Then: Only exact case match returns project
            assertAll(
                "Verify case sensitivity",
                { assertThat(foundLowercase).isNull() },
                { assertThat(foundUppercase).isNull() },
                { assertThat(foundCorrect).isNotNull }
            )
        }

        @Test
        fun `findByName with special characters works correctly`() {
            // Given: A project with special characters
            val specialName = "Project-2024_v1.0 (Beta)"
            projectPort.create(Project(name = specialName))

            // When: Finding by special name
            val found = projectPort.findByName(specialName)

            // Then: Project is found
            assertAll(
                "Verify special character search",
                { assertThat(found).isNotNull },
                { assertThat(found?.name).isEqualTo(specialName) }
            )
        }
    }

    @Nested
    @DisplayName("Update Operations")
    inner class UpdateOperations {
        @Test
        fun `update project description`() {
            // Given: An existing project
            val project =
                projectPort.create(
                    Project(name = "UpdateTest").apply {
                        description = "Original description"
                    }
                )

            // When: Updating description
            project.description = "Updated description"
            val updated = projectPort.update(project)

            // Then: Description is updated
            assertAll(
                "Verify description update",
                { assertThat(updated.description).isEqualTo("Updated description") },
                { assertThat(updated.name).isEqualTo("UpdateTest") },
                { assertThat(updated.id).isEqualTo(project.id) }
            )

            // And: Update is persisted
            val found = projectPort.findByIid(project.iid)
            assertThat(found?.description).isEqualTo("Updated description")
        }

        @Test
        fun `update project description to null`() {
            // Given: A project with description
            val project =
                projectPort.create(
                    Project(name = "NullUpdateTest").apply {
                        description = "Will be removed"
                    }
                )

            // When: Setting description to null
            project.description = null
            val updated = projectPort.update(project)

            // Then: Description is null
            assertThat(updated.description).isNull()
        }

        @Test
        fun `update project description to empty string`() {
            // Given: A project with description
            val project =
                projectPort.create(
                    Project(name = "EmptyUpdateTest").apply {
                        description = "Will be empty"
                    }
                )

            // When: Setting description to empty
            project.description = ""
            val updated = projectPort.update(project)

            // Then: Description is empty
            assertThat(updated.description).isEqualTo("")
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `update project with repository association`() {
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `update project fails when repository is replaced`() {
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `update project fails when repository is removed`() {
        }

        @Test
        @Disabled("Not implemented yet")
        fun `update project by adding issues`() {
        }

        @Test
        fun `update same project multiple times (idempotency)`() {
            // Given: A created project
            val project =
                projectPort.create(
                    Project(name = "IdempotentTest").apply {
                        description = "Original"
                    }
                )

            // When: Updating multiple times with same data
            val update1 = projectPort.update(project)
            val update2 = projectPort.update(update1)
            val update3 = projectPort.update(update2)

            // Then: All updates return same data
            assertAll(
                "Verify idempotency",
                { assertThat(update1.description).isEqualTo("Original") },
                { assertThat(update2.description).isEqualTo("Original") },
                { assertThat(update3.description).isEqualTo("Original") },
                { assertThat(update1.id).isEqualTo(update2.id) },
                { assertThat(update2.id).isEqualTo(update3.id) }
            )

            // And: Only one project exists
            assertThat(projectPort.findAll()).hasSize(1)
        }

        @Test
        fun `update project with very long description, 254 characters, should succeed`() {
            // Given: A project with short description
            val project =
                projectPort.create(
                    Project(name = "LongUpdateTest").apply {
                        description = "Short"
                    }
                )

            // When: Updating to very long description
            val longDesc = "a".repeat(254)
            project.description = longDesc
            val updated = projectPort.update(project)

            // Then: Long description is stored
            assertAll(
                "Verify long description update",
                { assertThat(updated.description).isEqualTo(longDesc) },
                { assertThat(updated.description!!.length).isEqualTo(254) }
            )
        }

        @Test
        fun `update project with very long description, 255 characters, should succeed`() {
            // Given: A project with short description
            val project =
                projectPort.create(
                    Project(name = "LongUpdateTest").apply {
                        description = "Short"
                    }
                )

            // When: Updating to very long description
            val longDesc = "a".repeat(255)
            project.description = longDesc
            val updated = projectPort.update(project)

            // Then: Long description is stored
            assertAll(
                "Verify long description update",
                { assertThat(updated.description).isEqualTo(longDesc) },
                { assertThat(updated.description!!.length).isEqualTo(255) }
            )
        }

        @Test
        fun `update project with very long description, 256 characters, should fail`() {
            // Given: A project with short description
            val project =
                projectPort.create(
                    Project(name = "LongUpdateTest").apply {
                        description = "Short"
                    }
                )

            // When: Updating to very long description
            val longDesc = "a".repeat(256)
            project.description = longDesc
            val ex =
                assertThrows<IllegalArgumentException> {
                    projectPort.update(project)
                }

            assertThat(ex.message).isEqualTo("Description must not exceed 255 characters.")
        }
    }

    @Nested
    @DisplayName("Delete Operations")
    inner class DeleteOperations {
        @Test
        fun `delete project by entity`() {
            // Given: An existing project
            val project = projectPort.create(Project(name = "ToDelete"))
            assertThat(projectPort.findAll()).hasSize(1)

            // When: Deleting the project
            assertThrows<UnsupportedOperationException> {
                projectPort.delete(project)
            }

            // Then: Project is removed, TODO uncomment iff delete operation is implemented
//            assertAll(
//                "Verify deletion",
//                { assertThat(projectPort.findAll()).isEmpty() },
//                { assertThat(projectPort.findById(project.id!!)).isNull() },
//                { assertThat(projectPort.findByName("ToDelete")).isNull() }
//            )
        }

        @Test
        fun `delete project by ID`() {
            // Given: An existing project
            val project = projectPort.create(Project(name = "DeleteById"))
            val projectId = project.id!!

            // When: Deleting by ID
            assertThrows<UnsupportedOperationException> {
                projectPort.deleteById(projectId)
            }

            // Then: Project is removed
//            assertAll(
//                "Verify deletion by ID",
//                { assertThat(projectPort.findAll()).isEmpty() },
//                { assertThat(projectPort.findById(projectId)).isNull() }
//            )
        }

        @Test
        fun `deleteAll removes all projects`() {
            // Given: Multiple projects exist
            projectPort.create(Project(name = "Project 1"))
            projectPort.create(Project(name = "Project 2"))
            projectPort.create(Project(name = "Project 3"))
            assertThat(projectPort.findAll()).hasSize(3)

            // When: Deleting all projects
            assertThrows<UnsupportedOperationException> { projectPort.deleteAll() }

            // Then: All projects are removed
//            assertThat(projectPort.findAll()).isEmpty()
        }

        @Test
        fun `delete project with repository cascades correctly`() {
            // Given: A project with associated repository
            val project = projectPort.create(Project(name = "ProjectWithRepo"))
            val repository =
                Repository(
                    localPath = "/repo/path",
                    projectId = project.iid,
                ).apply { this.project = project }
            repositoryPort.create(repository)

            // When: Deleting the project
            assertThrows<UnsupportedOperationException> { projectPort.delete(project) }

            // Then: Project is deleted (cascade behavior depends on configuration)
//            assertThat(projectPort.findAll()).isEmpty()
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `delete project with issues removes issues`() {
        }

        @Test
        fun `delete one project does not affect others`() {
            // Given: Multiple projects
            val project1 = projectPort.create(Project(name = "Project 1"))
            val project2 = projectPort.create(Project(name = "Project 2"))
            val project3 = projectPort.create(Project(name = "Project 3"))

            // When: Deleting one project
            assertThrows<UnsupportedOperationException> { projectPort.delete(project2) }

            // Then: Only the deleted project is removed
//            val remaining = projectPort.findAll()
//            assertAll(
//                "Verify selective deletion",
//                { assertThat(remaining).hasSize(2) },
//                {
//                    val names = remaining.map { it.name }
//                    assertThat(names).containsExactlyInAnyOrder("Project 1", "Project 3")
//                },
//                { assertThat(projectPort.findById(project2.id!!)).isNull() }
//            )
        }
    }

    @Nested
    @DisplayName("Domain Invariant Tests")
    inner class DomainInvariantTests {
        @Test
        fun `project name cannot be blank`() {
            // Given/When/Then: Creating project with blank name throws exception
            assertThrows<IllegalArgumentException> {
                Project(name = "   ")
            }
        }

        @Test
        fun `project name cannot be empty`() {
            // Given/When/Then: Creating project with empty name throws exception
            assertThrows<IllegalArgumentException> {
                Project(name = "")
            }
        }

        @Test
        fun `project name must not be only whitespace`() {
            // Given/When/Then: Creating project with whitespace-only name throws exception
            assertThrows<IllegalArgumentException> {
                Project(name = "\t\n  ")
            }
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `project repository is set-once and cannot be changed`() {
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `project repository cannot be set to null`() {
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `project repository can be set to same instance multiple times (idempotent)`() {
        }

        @Test
        fun `project uniqueKey is based on name`() {
            // Given: A project
            val project = Project(name = "TestProject")

            // When: Getting unique key
            val key = project.uniqueKey

            // Then: Key is based on name
            assertAll(
                "Verify unique key",
                { assertThat(key.name).isEqualTo("TestProject") },
                { assertThat(project.uniqueKey).isEqualTo(Project.Key("TestProject")) }
            )
        }

        @Test
        fun `project equality is identity-based not value-based`() {
            // Given: Two projects with same name
            val project1 = Project(name = "SameName")
            val project2 = Project(name = "SameName")

            // When: Comparing projects
            val areEqual = project1 == project2
            val haveSameHashCode = project1.hashCode() == project2.hashCode()

            // Then: Projects are not equal (identity-based equality)
            assertAll(
                "Verify identity-based equality",
                { assertThat(areEqual).isFalse() },
                { assertThat(project1.iid).isNotEqualTo(project2.iid) }
            )
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `project can exist without repository`() {
            val project = Project(name = "StandaloneProject")
            val created = projectPort.create(project)
            assertThat(created.name).isEqualTo("StandaloneProject")
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `removing issue is not supported yet`() {
        }

        @Disabled("Not implemented yet. Enable when removing issues is implemented.")
        @Test
        fun `project issues collection is mutable`() {
        }
    }

    @Nested
    @DisplayName("Edge Cases and Boundary Conditions")
    inner class EdgeCasesAndBoundaryConditions {
        @Test
        fun `create project with minimum valid name (single character)`() {
            // Given: A project with single character name
            val project = Project(name = "A")

            // When: Creating the project
            val created = projectPort.create(project)

            // Then: Project is created successfully
            assertThat(created.name).isEqualTo("A")
        }

        @Test
        fun `create project with name containing newlines and tabs`() {
            // Given: A project with whitespace characters in name
            val nameWithWhitespace = "Project\n\tWith\r\nWhitespace"
            val project = Project(name = nameWithWhitespace)

            // When: Creating the project
            val created = projectPort.create(project)

            // Then: Whitespace is preserved
            assertThat(created.name).isEqualTo(nameWithWhitespace)
        }

        @Test
        fun `create project with name that is pure numbers`() {
            // Given: A project with numeric name
            val project = Project(name = "1234567890")

            // When: Creating the project
            val created = projectPort.create(project)

            // Then: Numeric name is accepted
            assertThat(created.name).isEqualTo("1234567890")
        }

        @Test
        fun `create project with SQL-like characters in name (SQL injection prevention)`() {
            // Given: A project with SQL-like characters
            val sqlName = "Project'; DROP TABLE projects;--"
            val project = Project(name = sqlName)

            // When: Creating the project
            val created = projectPort.create(project)

            // Then: SQL characters are treated as literal string
            assertThat(created.name).isEqualTo(sqlName)

            // And: No SQL injection occurred
            assertThat(projectPort.findAll()).isNotEmpty()
        }

        @Test
        fun `findAll with very large page size`() {
            // Given: 5 projects exist
            repeat(5) { index ->
                projectPort.create(Project(name = "Project ${index + 1}"))
            }

            // When: Requesting page with size larger than total
            val page = projectPort.findAll(PageRequest.of(0, 1000))

            // Then: All projects are returned in single page
            assertAll(
                "Verify large page size",
                { assertThat(page.content).hasSize(5) },
                { assertThat(page.totalElements).isEqualTo(5) },
                { assertThat(page.totalPages).isEqualTo(1) }
            )
        }

        @Test
        fun `findAll with page beyond available pages returns empty`() {
            // Given: Only 3 projects exist
            repeat(3) { index ->
                projectPort.create(Project(name = "Project ${index + 1}"))
            }

            // When: Requesting page far beyond available data
            val page = projectPort.findAll(PageRequest.of(100, 10))

            // Then: Empty page is returned
            assertAll(
                "Verify out-of-bounds page",
                { assertThat(page.content).isEmpty() },
                { assertThat(page.totalElements).isEqualTo(3) },
                { assertThat(page.number).isEqualTo(100) }
            )
        }

        @Test
        fun `saveAll creates multiple projects atomically`() {
            // Given: Multiple projects to save
            val projects =
                listOf(
                    Project(name = "Batch 1"),
                    Project(name = "Batch 2"),
                    Project(name = "Batch 3"),
                    Project(name = "Batch 4"),
                    Project(name = "Batch 5")
                )

            // When: Saving all at once
            val saved = projectPort.saveAll(projects)

            // Then: All projects are created
            assertAll(
                "Verify batch creation",
                { assertThat(saved).hasSize(5) },
                { assertThat(projectPort.findAll()).hasSize(5) },
                {
                    val names = projectPort.findAll().map { it.name }
                    assertThat(names).containsExactlyInAnyOrder(
                        "Batch 1",
                        "Batch 2",
                        "Batch 3",
                        "Batch 4",
                        "Batch 5"
                    )
                }
            )
        }
    }

    @Nested
    @DisplayName("Integration with Repository")
    @Disabled("Refactored in domain model #454")
    inner class IntegrationWithRepository {
        @Test
        fun `project with repository maintains bidirectional relationship`() {
        }

        @Test
        @Disabled("DELETE operations not yet permitted")
        fun `deleting project with repository preserves or cascades based on configuration`() {
        }

        @Test
        fun `finding project by iid includes repository data`() {
        }
    }
}

// Helper that bypasses the domain guard rails so failure scenarios can be exercised explicitly.
// private fun Project.forceSetRepo(repository: Repository?) =
//    Project::class.java.getDeclaredField("repo").apply { isAccessible = true }.also { it.set(this, repository) }
