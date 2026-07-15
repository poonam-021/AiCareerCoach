# AI Career Coach

AI Career Coach is a full-stack, microservices-based web application that helps job seekers optimize their resumes, evaluate job compatibility, and prepare for interviews using AI.

The system consists of a Spring Boot backend for authentication, user management, data persistence, and API orchestration, along with a FastAPI-based AI microservice powered by LangChain, LangGraph, and the Gemini API for intelligent resume analysis and career guidance.

## Key Features

* Secure JWT-based authentication
* Resume and Job Description upload
* AI-powered resume parsing
* ATS score analysis
* Job Description matching
* Skill gap identification
* AI recruiter approval/rejection with feedback
* Resume improvement suggestions
* Cover letter and professional email generation
* Personalized interview question generation
* Learning roadmap based on missing skills
* Analysis history and dashboard analytics

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, shadcn/ui

**Backend:** Spring Boot, FastAPI, PostgreSQL

**AI:** LangChain, LangGraph, Gemini API

**Authentication:** Spring Security, JWT

## Architecture

The application follows a microservices architecture where the Spring Boot service manages authentication, business logic, and database operations, while the FastAPI AI service handles all AI-driven analysis and recommendations. This separation improves scalability, maintainability, and independent deployment of services.
