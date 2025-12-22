---
layout: doc
outline: deep
title: 'Overview'
description: 'Important notes before using NekoBox'
date: 2025-06-17
editLink: true
head:
  - - meta
    - name: keywords
      content: vless, subscription
---

# Overview

Welcome to Harmony, a sophisticated Cloudflare Workers-based proxy solution designed for seamless network traffic management and VLESS protocol implementation. This project provides a comprehensive proxy infrastructure that combines performance optimization with advanced security features.

<br/> 

## Project Architecture
Harmony operates as a distributed proxy system built on Cloudflare's edge computing platform, utilizing the VLESS protocol for secure and efficient traffic routing. The system is designed with modularity in mind, separating configuration management, proxy handling, and user interface components.

<img width="1052" height="997" alt="1000270646" src="https://github.com/user-attachments/assets/9d34f242-d711-409d-b74f-c0a49bac4eeb" />

<br/> 

## Core Components
The Harmony project consists of several key files that work together to provide a complete proxy solution:

- **harmony.js:** The main configuration generator that creates VLESS proxy configurations with clean IP addresses from multiple sources harmony.js

- **src/index.js:** Core proxy implementation handling WebSocket connections, TCP/UDP traffic, and user authentication src/index.js

- **_worker.js:** Production-ready obfuscated version of the proxy implementation for deployment
cf-clean.json: Configuration file containing clean Cloudflare IP addresses for optimal performance


## Key Features
### Dynamic Configuration Generation
Harmony automatically generates VLESS configurations using:

- Multiple IP sources for redundancy and performance
- Randomized fingerprint selection for enhanced anonymity
- Configurable ports and ALPN protocols
Base64-encoded output for easy client import


## Advanced Proxy Capabilities
- **Protocol Support:** Full VLESS protocol implementation with WebSocket transport
- **Traffic Handling:** Support for both TCP and UDP traffic (DNS queries)
- **Security Features:** UUID-based authentication and Scamalytics integration for IP reputation checking
- **Performance Optimization:** Clean IP management and intelligent routing


## User-Friendly Interface
- Web-based configuration panel with real-time updates
- Multiple client configuration formats (Clash Meta, NekoBox)
- Dynamic parameter customization
- Built-in IP reputation checking


## Technical Implementation
The system leverages modern JavaScript features and Cloudflare Workers APIs to deliver high-performance proxy services:

<br/>

<img width="1079" height="727" alt="1000270649" src="https://github.com/user-attachments/assets/c1a0ee52-e048-43a5-abf3-71b3d863c600" />


## Configuration Structure
Harmony uses a hierarchical configuration system:

| Component | Purpose | Key Settings |
| --------- | ------- | ------------ |
| VLESS Config | Core proxy settings |	UUID, host, port, path
| Network Settings | Transport parameters | TLS, WebSocket, ALPN
Security Options | Authentication & privacy | Fingerprints, early data | 
| Performance Tuning | Optimization settings | IP sources, port selection |

<br/> 

## Getting Started
To begin using Harmony, you'll want to progress through the following documentation:

**1. Quick Start:** Learn the basics of deploying Harmony to Cloudflare Workers

**2. Understanding VLESS Protocol Basics:** Understand the underlying protocol that powers Harmony  

**2. Cloudflare Workers Setup Guide:** Detailed setup instructions for your deployment environment
The project is designed to be accessible to beginners while providing advanced features for experienced users. The modular architecture allows for easy customization and extension based on specific requirements.

## Next Steps

::: tip 
After reviewing this overview, continue with **Quick Start** to get your Harmony proxy running in minutes. The documentation is structured to guide you from basic deployment to advanced configuration and optimization techniques.  
:::

