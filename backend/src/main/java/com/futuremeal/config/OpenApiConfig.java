package com.futuremeal.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI futureMealOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FutureMeal API")
                        .description("Indian food delivery platform with AI-powered meal planning. " +
                                "The FutureMeal feature lets users plan meals in advance — " +
                                "the engine watches restaurants and recommends the best match.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("FutureMeal Team")
                                .email("hello@futuremeal.in"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://futuremeal.in")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter your JWT token")));
    }
}
