# Skill: Screen-Aware Writing

## Purpose

Turn rough spoken or typed instructions into polished writing based on **current screen context**.

## Use cases

- Email reply  
- X (Twitter) post  
- Product update  
- Support response  
- README paragraph  

## Workflow

1. Capture visible draft/notes/email (`screenlane_capture`).  
2. Take instruction (`screenlane_dictate` text mode is fine).  
3. `screenlane_command` with writing intent (reply / x post / docs).  
4. Route to `clipboard` or `tera` for final polish if desired.

## Prompt style

- Match tone to visible context  
- One strong primary draft  
- Optional shorter alternative  
- Do not invent facts not present in context  

## Safety

- Do not leak private email threads to untrusted endpoints without consent  
- Prefer local clipboard when unsure  

## Examples

See `examples.md`.
