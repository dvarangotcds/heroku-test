import { NextFunction, Request, Response, Router } from 'express'
import { minimumSignupKeywords } from './../../config'
import { keywordsSuggester, logger } from './../../services'
import { ErrorPayload } from './../error_payload'
import { User } from '../models'

export async function minimumAmountOfKeywordsAsync(request: Request, response: Response, next: NextFunction) {
  response.status(200).json(minimumSignupKeywords)
  next()
}

export async function getPopularKeywordsAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const popularKeywords = await keywordsSuggester.getPopularKeywordsAsync()
    response.status(200).json(popularKeywords)
    next()
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).end()
  }
}

export async function getKeywordSuggestions(request: Request, response: Response, next: NextFunction) {
  try {
    const user = response.locals.loggedUser as User
    let suggestion: any[] = []
    if (user) {
      suggestion = await keywordsSuggester.getKeywordsSuggestion(user.keywords, '')
    } else {
      //popular keywords
      suggestion = await keywordsSuggester.getPopularKeywordsAsync()
    }
    response.status(200).json(suggestion)
    next()
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).end()
  }
}

export async function getSortedSet(request: Request, response: Response, next: NextFunction) {
  let result = await keywordsSuggester.getSortedSet()
  response.status(200).json(result)
}
