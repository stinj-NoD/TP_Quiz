import type { AgeLevel, Question, QuestionBank } from '../../types/question.types'

import geographieAdulte from './adulte/geographie.json'
import divertissementAdulte from './adulte/divertissement.json'
import histoireAdulte from './adulte/histoire.json'
import artLitteratureAdulte from './adulte/art-litterature.json'
import sciencesNatureAdulte from './adulte/sciences-nature.json'
import sportLoisirsAdulte from './adulte/sport-loisirs.json'

import geographieEnfant from './enfant/geographie.json'
import divertissementEnfant from './enfant/divertissement.json'
import histoireEnfant from './enfant/histoire.json'
import artLitteratureEnfant from './enfant/art-litterature.json'
import sciencesNatureEnfant from './enfant/sciences-nature.json'
import sportLoisirsEnfant from './enfant/sport-loisirs.json'

import geographieAdo from './ado/geographie.json'
import divertissementAdo from './ado/divertissement.json'
import histoireAdo from './ado/histoire.json'
import artLitteratureAdo from './ado/art-litterature.json'
import sciencesNatureAdo from './ado/sciences-nature.json'
import sportLoisirsAdo from './ado/sport-loisirs.json'

export const QUESTION_BANKS: Record<AgeLevel, QuestionBank> = {
  adulte: {
    geographie: geographieAdulte as Question[],
    divertissement: divertissementAdulte as Question[],
    histoire: histoireAdulte as Question[],
    'art-litterature': artLitteratureAdulte as Question[],
    'sciences-nature': sciencesNatureAdulte as Question[],
    'sport-loisirs': sportLoisirsAdulte as Question[],
  },
  enfant: {
    geographie: geographieEnfant as Question[],
    divertissement: divertissementEnfant as Question[],
    histoire: histoireEnfant as Question[],
    'art-litterature': artLitteratureEnfant as Question[],
    'sciences-nature': sciencesNatureEnfant as Question[],
    'sport-loisirs': sportLoisirsEnfant as Question[],
  },
  ado: {
    geographie: geographieAdo as Question[],
    divertissement: divertissementAdo as Question[],
    histoire: histoireAdo as Question[],
    'art-litterature': artLitteratureAdo as Question[],
    'sciences-nature': sciencesNatureAdo as Question[],
    'sport-loisirs': sportLoisirsAdo as Question[],
  },
}
