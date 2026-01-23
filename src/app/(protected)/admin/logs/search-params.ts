import { 
  createSearchParamsCache, 
  parseAsInteger, 
  parseAsString 
} from 'nuqs/server'

export const parsers = {
  q: parseAsString.withDefault(''),
  operation: parseAsString,
  table: parseAsString,
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(20),
  sort: parseAsString.withDefault('created_at.desc'),
}

export const searchParamsCache = createSearchParamsCache(parsers)
