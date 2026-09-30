# ADR-002: NestJS Modular Backend Architecture

## Status

Accepted

## Context

The streaming backend requires robust dependency injection, structured modular domain encapsulation, strong type safety, declarative validation, and extensibility for caching, messaging, and database transactions.

## Decision

We adopt NestJS with a modular monolith paradigm. Controllers act strictly as thin HTTP presentation layers; application logic resides in injectable domain services; input validation is enforced via class-validator and standard DTOs.

## Answers to Architectural Questions

1. **What are we doing?**  
   Structuring the backend into modular domain modules (`auth`, `users`, `profiles`, `content`, `streaming`, `search`, etc.) around NestJS dependency injection.
2. **Why are we doing it?**  
   To maintain clear architectural boundaries, promote testability via mockable providers, and prevent leaky abstractions.
3. **What problem does it solve?**  
   Prevents "spaghetti code", provides standardized global error filters and validation pipes, and ensures the codebase can scale cleanly or be decomposed into microservices later if necessary.
4. **What alternatives exist?**
   - Express with raw routers
   - Fastify without NestJS
   - Microservices from day 1
5. **Why was this approach selected?**  
   NestJS delivers enterprise-grade conventions, out-of-the-box OpenAPI/Swagger integration, powerful modularity, and first-class TypeScript support without overengineering.
