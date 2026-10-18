package com.inso_world.binocular.web.restcontroller

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.inso_world.binocular.core.integration.base.TestDataProvider
import com.inso_world.binocular.web.restcontroller.base.RestControllerTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

/**
 * Test class for DbExportController.
 *
 */
internal class DbExportControllerTest : RestControllerTest() {
    @Autowired
    lateinit var mockMvc: MockMvc

    @Test
    fun `should export all collections from database`() {
        val mvcResult =
            mockMvc
                .get("/api/db-export")
                .andExpect {
                    status { isOk() }
                    content { contentType(MediaType.APPLICATION_JSON) }
                }.andReturn()

        // parse the JSON
        val jsonString = mvcResult.response.contentAsString
        val jsonNode: JsonNode = jacksonObjectMapper().readTree(jsonString)

        // assertions to check if all collections have been correctly exported
        // comparing the attributes of the test data with the data from the export
        assertAll(
            // accounts
            {
                val accounts = jsonNode["accounts"]
                assertEquals(TestDataProvider.testAccounts.size, accounts.size(), "accounts size mismatch")

                // check if the attributes of the exported accounts match the expected accounts (platform, user, ...)
                TestDataProvider.testAccounts.forEachIndexed { index, expected ->
                    val actual = accounts[index]

                    // assertEquals(expected.id.toString(), actual.get("_id").asText(), "Account $index mismatch")
                    assertEquals(
                        expected.platform.toString(),
                        actual.get("platform").asText(),
                        "Account $index platform mismatch: expected ${expected.id}, got ${
                            actual.get("platform").asText()
                        }",
                    )
                    assertEquals(
                        expected.login,
                        actual.get("login").asText(),
                        "Account $index login mismatch: expected ${expected.login}, got ${
                            actual.get("login").asText()
                        }",
                    )
                    assertEquals(
                        expected.name,
                        actual.get("name").asText(),
                        "Account $index name mismatch: expected ${expected.name}, got ${actual.get("name").asText()}",
                    )
                    assertEquals(
                        expected.avatarUrl,
                        actual.get("avatarUrl").asText(),
                        "Account $index avatarUrl mismatch: expected ${expected.avatarUrl}, got ${
                            actual.get("avatarUrl").asText()
                        }",
                    )
                    assertEquals(
                        expected.url,
                        actual.get("url").asText(),
                        "Account $index url mismatch: expected ${expected.url}, got ${actual.get("url").asText()}",
                    )
                }
            },
            // commits
            {
                val commits = jsonNode["commits"]
                assertEquals(TestDataProvider.testCommits.size, commits?.size() ?: 0, "commits size mismatch")

                TestDataProvider.testCommits.forEachIndexed { index, expected ->
                    val actual = commits[index]

                    // id and date field are currently not yet verified
                    assertEquals(
                        expected.sha,
                        actual.get("sha").asText(),
                        "Commit $index sha mismatch: expected ${expected.sha}, got ${actual.get("sha").asText()}",
                    )
                    assertEquals(
                        expected.message,
                        actual.get("message").asText(),
                        "Commit $index message mismatch: expected ${expected.message}, got ${
                            actual.get("message").asText()
                        }",
                    )
                    assertEquals(
                        expected.branch,
                        actual.get("branch").asText(),
                        "Commit $index branch mismatch: expected ${expected.branch}, got ${
                            actual.get("branch").asText()
                        }",
                    )
                    assertEquals(
                        expected.webUrl,
                        actual.get("webUrl").asText(),
                        "Commit $index webUrl mismatch: expected ${expected.webUrl}, got ${
                            actual.get("webUrl").asText()
                        }",
                    )
                    assertEquals(
                        expected.stats?.additions?.toInt(),
                        actual.get("stats").get("additions").asInt(),
                        "Commit $index additions mismatch: expected ${expected.stats?.additions}, got ${
                            actual.get(
                                "stats",
                            ).get("additions").asInt()
                        }",
                    )
                    assertEquals(
                        expected.stats?.deletions?.toInt(),
                        actual.get("stats").get("deletions").asInt(),
                        "Commit $index deletions mismatch: expected ${expected.stats?.deletions}, got ${
                            actual.get(
                                "stats",
                            ).get("deletions").asInt()
                        }",
                    )
                }
            },
            // branches
            {
                val branches = jsonNode["branches"]
                assertEquals(TestDataProvider.testBranches.size, branches?.size() ?: 0, "branches size mismatch")

                TestDataProvider.testBranches.forEachIndexed { index, expected ->
                    val actual = branches[index]

                    // assertEquals(expected.id, actual.get("id").asText(), "Branch $index id mismatch: expected ${expected.id}, got ${actual.get("id").asText()}")
                    assertEquals(
                        expected.branch,
                        actual.get("branch").asText(),
                        "Branch $index branches mismatch: expected ${expected.branch}, got ${
                            actual.get("branch").asText()
                        }",
                    )
                    assertEquals(
                        expected.active,
                        actual.get("active").asBoolean(),
                        "Branch $index active mismatch: expected ${expected.active}, got ${
                            actual.get("active").asBoolean()
                        }",
                    )
                    assertEquals(
                        expected.tracksFileRenames,
                        actual.get("tracksFileRenames").asBoolean(),
                        "Branch $index tracksFileRename mismatch: expected ${expected.tracksFileRenames}, got ${
                            actual.get(
                                "tracksFileRenames",
                            ).asBoolean()
                        }",
                    )
                    assertEquals(
                        expected.latestCommit,
                        actual.get("latestCommit").asText(),
                        "Branch $index latestCommit mismatch: expected ${expected.latestCommit}, got ${
                            actual.get(
                                "latestCommit",
                            ).asText()
                        }",
                    )
                }
            },
            // builds
            {
                val builds = jsonNode["builds"]
                assertEquals(TestDataProvider.testBuilds.size, builds?.size() ?: 0, "builds size mismatch")

                TestDataProvider.testBuilds.forEachIndexed { index, expected ->
                    val actual = builds[index]

                    // assertEquals(expected.id, actual.get("id").asText(), "Build $index id mismatch: expected ${expected.id}, got ${actual.get("id").asText()}")
                    assertEquals(
                        expected.sha,
                        actual.get("sha").asText(),
                        "Build $index sha mismatch: expected ${expected.sha}, got ${actual.get("sha").asText()}",
                    )
                    assertEquals(
                        expected.ref,
                        actual.get("ref").asText(),
                        "Build $index ref mismatch: expected ${expected.ref}, got ${actual.get("ref").asText()}",
                    )
                    assertEquals(
                        expected.status,
                        actual.get("status").asText(),
                        "Build $index status mismatch: expected ${expected.status}, got ${
                            actual.get("status").asText()
                        }",
                    )
                    assertEquals(
                        expected.tag,
                        actual.get("tag").asText(),
                        "Build $index tag mismatch: expected ${expected.tag}, got ${actual.get("tag").asText()}",
                    )
                    assertEquals(
                        expected.user,
                        actual.get("user").asText(),
                        "Build $index user mismatch: expected ${expected.user}, got ${actual.get("user").asText()}",
                    )
                    assertEquals(
                        expected.userFullName,
                        actual.get("userFullName").asText(),
                        "Build $index userFullName mismatch: expected ${expected.userFullName}, got ${
                            actual.get("userFullName").asText()
                        }",
                    )
                    assertEquals(
                        expected.duration,
                        actual.get("duration").asInt(),
                        "Build $index duration mismatch: expected ${expected.duration}, got ${
                            actual.get("duration").asInt()
                        }",
                    )
                    assertEquals(
                        expected.webUrl,
                        actual.get("webUrl").asText(),
                        "Build $index webUrl mismatch: expected ${expected.webUrl}, got ${
                            actual.get("webUrl").asText()
                        }",
                    )
                }
            },
            // files
            {
                val files = jsonNode["files"]
                assertEquals(TestDataProvider.testFiles.size, files?.size() ?: 0, "files size mismatch")

                TestDataProvider.testFiles.forEachIndexed { index, expected ->
                    val actual = files[index]

                    // assertEquals(expected.id, actual.get("id").asText(), "File $index id mismatch: expected ${expected.id}, got ${actual.get("id").asText()}")
                    assertEquals(
                        expected.path,
                        actual.get("path").asText(),
                        "File $index path mismatch: expected ${expected.path}, got ${actual.get("path").asText()}",
                    )
                    assertEquals(
                        expected.webUrl,
                        actual.get("webUrl").asText(),
                        "File $index webUrl mismatch: expected ${expected.webUrl}, got ${
                            actual.get("webUrl").asText()
                        }",
                    )
                }
            },
            // issues
            {
                val issues = jsonNode["issues"]
                assertEquals(TestDataProvider.testIssues.size, issues?.size() ?: 0, "issues size mismatch")

                TestDataProvider.testIssues.forEachIndexed { index, expected ->
                    val actual = issues[index]

                    // TODO id and attributes of type Date()
                    // assertEquals(expected.iid, actual.get("iid").asInt(),
                    //  "Issue $index iid mismatch: expected ${expected.iid}, got ${actual.get("iid").asInt()}")
                    assertEquals(
                        expected.platformIid,
                        actual.get("platformIid")?.asInt() ?: actual.get("iid").asInt(),
                        "Issue $index iid mismatch: expected ${expected.platformIid}, got ${actual
                            .get(
                                "platformIid"
                            )?.asInt() ?: actual.get("iid").asInt()}",
                    )
                    assertEquals(
                        expected.title,
                        actual.get("title").asText(),
                        "Issue $index title mismatch: expected ${expected.title}, got ${actual.get("title").asText()}",
                    )
                    assertEquals(
                        expected.description,
                        actual.get("description").asText(),
                        "Issue $index description mismatch: expected ${expected.description}, got ${
                            actual.get("description").asText()
                        }",
                    )
                    assertEquals(
                        expected.state,
                        actual.get("state").asText(),
                        "Issue $index state mismatch: expected ${expected.state}, got ${actual.get("state").asText()}",
                    )
                    assertEquals(
                        expected.webUrl,
                        actual.get("webUrl").asText(),
                        "Issue $index webUrl mismatch: expected ${expected.webUrl}, got ${
                            actual.get("webUrl").asText()
                        }",
                    )
                    // date checks still missing

                    // verify labels
                    val expectedLabels = expected.labels
                    val actualLabels = actual.get("labels")
                    assertEquals(expectedLabels.size, actualLabels.size(), "Issue $index labels size mismatch")

                    expectedLabels.forEachIndexed { labelIndex, expectedLabel ->
                        assertEquals(
                            expectedLabel,
                            actualLabels[labelIndex].asText(),
                            "Issue $index label $labelIndex mismatch: expected $expectedLabel, got ${actualLabels[labelIndex].asText()}",
                        )
                    }

                    // verify mentions
                    val expectedMentions = expected.mentions
                    val actualMentions = actual.get("mentions")
                    assertEquals(expectedMentions.size, actualMentions.size(), "Issue $index mentions size mismatch")

                    expectedMentions.forEachIndexed { mentionIndex, expectedMention ->
                        assertEquals(
                            expectedMention.commit,
                            actualMentions[mentionIndex].get("commit").asText(),
                            "Issue $index mention $mentionIndex commitId mismatch: expected ${expectedMention.commit}, got ${
                                actualMentions[mentionIndex].get(
                                    "commit",
                                ).asText()
                            }",
                        )
                        assertEquals(
                            expectedMention.closes,
                            actualMentions[mentionIndex].get("closes").asBoolean(),
                            "Issue $index mention $mentionIndex closes mismatch: expected ${expectedMention.closes}, got ${
                                actualMentions[mentionIndex].get(
                                    "closes",
                                ).asBoolean()
                            }",
                        )
                        // date check currently still missing
                    }
                }
            },
            // merge requests
            {
                val mergeRequests =
                    jsonNode["mergeRequests"]
                        ?: jsonNode["merge_requests"]
                assertEquals(
                    TestDataProvider.testMergeRequests.size,
                    mergeRequests?.size() ?: 0,
                    "merge_requests size mismatch",
                )

                TestDataProvider.testMergeRequests.forEachIndexed { index, expected ->
                    val actual = mergeRequests[index]
                    // id and date verification are missing
                    assertEquals(
                        expected.platformIid,
                        actual.get("platformIid")?.asInt() ?: actual.get("iid").asInt(),
                        "MergeRequest $index iid mismatch: expected ${expected.platformIid}, got ${actual
                            .get(
                                "platformIid"
                            )?.asInt() ?: actual.get("iid").asInt()}",
                    )
                    assertEquals(
                        expected.title,
                        actual.get("title").asText(),
                        "MergeRequest $index title mismatch: expected ${expected.title}, got ${
                            actual.get("title").asText()
                        }",
                    )
                    assertEquals(
                        expected.description,
                        actual.get("description").asText(),
                        "MergeRequest $index description mismatch: expected ${expected.description}, got ${
                            actual.get(
                                "description",
                            ).asText()
                        }",
                    )
                    assertEquals(
                        expected.state,
                        actual.get("state").asText(),
                        "MergeRequest $index state mismatch: expected ${expected.state}, got ${
                            actual.get("state").asText()
                        }",
                    )
                    assertEquals(
                        expected.webUrl,
                        actual.get("webUrl").asText(),
                        "MergeRequest $index webUrl mismatch: expected ${expected.webUrl}, got ${
                            actual.get("webUrl").asText()
                        }",
                    )

                    val expectedLabels = expected.labels
                    val actualLabels = actual.get("labels")
                    assertEquals(expectedLabels.size, actualLabels.size(), "MergeRequest $index labels size mismatch")
                    expectedLabels.forEachIndexed { labelIndex, expectedLabel ->
                        assertEquals(
                            expectedLabel,
                            actualLabels[labelIndex].asText(),
                            "MergeRequest $index label $labelIndex mismatch: expected $expectedLabel, got ${actualLabels[labelIndex].asText()}",
                        )
                    }

                    val expectedMentions = expected.mentions
                    val actualMentions = actual.get("mentions")
                    assertEquals(
                        expectedMentions.size,
                        actualMentions.size(),
                        "MergeRequest $index mentions size mismatch",
                    )
                    expectedMentions.forEachIndexed { mentionIndex, expectedMention ->
                        assertEquals(
                            expectedMention.commit,
                            actualMentions[mentionIndex].get("commit").asText(),
                            "MergeRequest $index mention $mentionIndex commitId mismatch: expected ${expectedMention.commit}, got ${
                                actualMentions[mentionIndex].get(
                                    "commit",
                                ).asText()
                            }",
                        )
                        assertEquals(
                            expectedMention.closes,
                            actualMentions[mentionIndex].get("closes").asBoolean(),
                            "MergeRequest $index mention $mentionIndex closes mismatch: expected ${expectedMention.closes}, got ${
                                actualMentions[mentionIndex].get(
                                    "closes",
                                ).asBoolean()
                            }",
                        )
                        // date check currently still missing
                    }
                }
            },
            // modules
            {
                val modules = jsonNode["modules"]
                assertEquals(TestDataProvider.testModules.size, modules?.size() ?: 0, "modules size mismatch")

                TestDataProvider.testModules.forEachIndexed { index, expected ->
                    val actual = modules[index]

                    // id check missing
                    assertEquals(
                        expected.path,
                        actual.get("path").asText(),
                        "Module $index path mismatch: expected ${expected.path}, got ${actual.get("path").asText()}",
                    )
                }
            },
            // notes
            {
                val notes = jsonNode["notes"]
                assertEquals(TestDataProvider.testNotes.size, notes?.size() ?: 0, "notes size mismatch")

                TestDataProvider.testNotes.forEachIndexed { index, expected ->
                    val actual = notes[index]

                    assertEquals(
                        expected.body,
                        actual.get("body").asText(),
                        "Note $index body mismatch: expected ${expected.body}, got ${actual.get("body").asText()}",
                    )
                    // validation of dates is still missing
                    assertEquals(
                        expected.system,
                        actual.get("system").asBoolean(),
                        "Note $index system mismatch: expected ${expected.system}, got ${
                            actual.get("system").asBoolean()
                        }",
                    )
                    assertEquals(
                        expected.resolvable,
                        actual.get("resolvable").asBoolean(),
                        "Note $index resolvable mismatch: expected ${expected.resolvable}, got ${
                            actual.get("resolvable").asBoolean()
                        }",
                    )
                    assertEquals(
                        expected.confidential,
                        actual.get("confidential").asBoolean(),
                        "Note $index confidential mismatch: expected ${expected.confidential}, got ${
                            actual.get(
                                "confidential",
                            ).asBoolean()
                        }",
                    )
                    assertEquals(
                        expected.internal,
                        actual.get("internal").asBoolean(),
                        "Note $index internal mismatch: expected ${expected.internal}, got ${
                            actual.get("internal").asBoolean()
                        }",
                    )
                    assertEquals(
                        expected.imported,
                        actual.get("imported").asBoolean(),
                        "Note $index imported mismatch: expected ${expected.imported}, got ${
                            actual.get("imported").asBoolean()
                        }",
                    )
                    assertEquals(
                        expected.importedFrom,
                        actual.get("importedFrom").asText(),
                        "Note $index importedFrom mismatch: expected ${expected.importedFrom}, got ${
                            actual.get("importedFrom").asText()
                        }",
                    )
                }
            },
            // users
            {
                val users = jsonNode["users"]
                assertEquals(TestDataProvider.testUsers.size, users?.size() ?: 0, "users size mismatch")

                TestDataProvider.testUsers.forEachIndexed { index, expected ->
                    val actual = users[index]

                    // id check still missing
                    assertEquals(
                        expected.gitSignature,
                        actual.get("gitSignature").asText(),
                        "User $index gitSignature mismatch: expected ${expected.gitSignature}, got ${
                            actual.get("gitSignature").asText()
                        }",
                    )
                }
            },
            // milestones
            {
                val milestones = jsonNode["milestones"]
                assertEquals(TestDataProvider.testMilestones.size, milestones?.size() ?: 0, "milestones size mismatch")

                TestDataProvider.testMilestones.forEachIndexed { index, expected ->
                    val actual = milestones[index]

                    // id check still missing (also date checks)

                    assertEquals(
                        expected.platformIid,
                        actual.get("platformIid")?.asInt() ?: actual.get("iid").asInt(),
                        "Milestone $index iid mismatch: expected ${expected.platformIid}, got ${actual
                            .get(
                                "platformIid"
                            )?.asInt() ?: actual.get("iid").asInt()}",
                    )
                    assertEquals(
                        expected.title,
                        actual.get("title").asText(),
                        "Milestone $index title mismatch: expected ${expected.title}, got ${
                            actual.get("title").asText()
                        }",
                    )
                    assertEquals(
                        expected.description,
                        actual.get("description").asText(),
                        "Milestone $index description mismatch: expected ${expected.description}, got ${
                            actual.get(
                                "description",
                            ).asText()
                        }",
                    )
                    assertEquals(
                        expected.state,
                        actual.get("state").asText(),
                        "Milestone $index state mismatch: expected ${expected.state}, got ${
                            actual.get("state").asText()
                        }",
                    )
                    assertEquals(
                        expected.webUrl,
                        actual.get("webUrl").asText(),
                        "Milestone $index webUrl mismatch: expected ${expected.webUrl}, got ${
                            actual.get("webUrl").asText()
                        }",
                    )
                }
            },
        )
    }
}
