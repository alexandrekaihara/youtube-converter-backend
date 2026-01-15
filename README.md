# YouTube Converter Backend

## Description

A high-performance, scalable backend service for converting YouTube videos to audio or video formats. This service acts as a lightweight API layer that retrieves available download formats and streaming URLs from videos, which are then processed client-side by the frontend application.

**Key Features:**
- Fast format/resolution metadata retrieval with Redis caching
- Direct streaming URL generation via yt-dlp
- IP-based rate limiting for anonymous users
- Horizontal scaling with Kubernetes
- Lightweight architecture optimized for 2M+ monthly visits

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React + TypeScript Frontend               │
│                   (Handles file downloads)                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │   Kubernetes Service (Load Balance)    │
        │   - Distributes traffic to pods        │
        │   - Rate Limiting (app-level)          │
        └────────────┬───────────────────────────┘
                     │
        ┌────────────┴──────────────┐
        ▼                           ▼
   ┌─────────────┐            ┌─────────────┐
   │  API Pod 1  │            │  API Pod 2  │  (Auto-scales with K8s)
   │ Node.js +   │            │ Node.js +   │
   │ TypeScript  │            │ TypeScript  │
   └──────┬──────┘            └──────┬──────┘
          │                          │
          └──────────────┬───────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
    ┌──────────────┐            ┌──────────────────┐
    │   Redis      │            │   PostgreSQL     │
    │              │            │                  │
    │ - Metadata   │            │ - Conversion     │
    │   Cache      │            │   History        │
    │ - Session    │            │ - User Stats     │
    │   Cache      │            │ - Rate Limits    │
    └──────────────┘            └──────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + TypeScript | Client-side video conversion & downloads |
| **API Server** | Node.js + TypeScript + Express/Fastify | RESTful API endpoints |
| **Caching** | Redis | Metadata caching, session storage |
| **Database** | PostgreSQL | Conversion history, analytics, rate limit tracking |
| **Container Orchestration** | Kubernetes | Auto-scaling, load balancing, deployment management |
| **Video Processing** | yt-dlp | Format detection, URL generation |

### Scaling Strategy

#### Caching Layer (Redis)
- **Metadata Cache**: 24-48 hour TTL (reduces yt-dlp calls by 95%+)
- **Memory Size**: 4-8GB (configurable)
- **Replication**: Redis Sentinel for high availability