# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DOPE-Prompt-Book is a library for modular prompt construction. The goal is to build composable prompt components that can be combined to produce intended LLM outputs.

## Current State

This project is a working local MVP.

- Prompt definitions live in repo-backed Markdown files under `prompts/`
- The Next.js app reads and mutates those prompts through API routes
- Browser storage is used only for workspace state and prompt usage data
- The current focus is a single-user, local-first prompt library and composer
