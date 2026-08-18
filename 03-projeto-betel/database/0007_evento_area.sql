-- =====================================================================
-- Betel Company — Sistema de Gestão
-- Migration: área de negócio do evento (Noivas/Eventos/Decorações/Estúdio)
-- =====================================================================
--
-- Contexto: o cliente já opera com uma categorização de eventos por área
-- de negócio (modelo de referência em Desktop/Agenda Betel/app.js, um
-- app à parte que ele mesmo fez). O MVP atual não tinha esse campo —
-- adicionado a pedido explícito do usuário em 2026-08-18.
--
-- Puramente aditiva: enum novo + 1 coluna nullable em evento (eventos
-- existentes ficam sem área até serem editados, não quebra nada).
--
-- Rollback:
--   alter table public.evento drop column if exists area;
--   drop type if exists area_negocio;
-- =====================================================================

begin;

create type area_negocio as enum ('noivas', 'eventos', 'decoracoes', 'estudio');

alter table public.evento
  add column if not exists area area_negocio;

commit;
