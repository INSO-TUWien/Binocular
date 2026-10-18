package com.inso_world.binocular.web.graphql.config

import com.inso_world.binocular.web.graphql.model.Sort
import graphql.language.EnumValue
import graphql.language.StringValue
import graphql.schema.Coercing
import graphql.schema.CoercingParseLiteralException
import graphql.schema.CoercingParseValueException
import graphql.schema.CoercingSerializeException
import graphql.schema.GraphQLScalarType
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.graphql.execution.RuntimeWiringConfigurer

@Configuration
class SortScalarConfig {
    @Bean
    fun sortScalarConfigurer(): RuntimeWiringConfigurer {
        val scalar =
            GraphQLScalarType
                .newScalar()
                .name("Sort")
                .description("Sort direction (ASC or DESC, case-insensitive)")
                .coercing(
                    object : Coercing<Sort, String> {
                        override fun serialize(dataFetcherResult: Any): String =
                            (dataFetcherResult as? Sort)?.name
                                ?: throw CoercingSerializeException(
                                    "Expected Sort but was ${dataFetcherResult::class.java.name}"
                                )

                        override fun parseValue(input: Any): Sort =
                            when (input) {
                                is String -> parse(input)
                                is Sort -> input
                                else -> throw CoercingParseValueException(
                                    "Expected String or Sort but was ${input::class.java.name}"
                                )
                            }

                        override fun parseLiteral(input: Any): Sort =
                            when (input) {
                                is StringValue -> parse(input.value)
                                is EnumValue -> parse(input.name)
                                else -> throw CoercingParseLiteralException(
                                    "Expected String or Enum literal but was $input"
                                )
                            }

                        private fun parse(value: String): Sort =
                            try {
                                enumValueOf<Sort>(value.trim().uppercase())
                            } catch (ex: IllegalArgumentException) {
                                throw CoercingParseValueException("Invalid sort value: $value")
                            }
                    }
                ).build()

        return RuntimeWiringConfigurer { it.scalar(scalar) }
    }
}
