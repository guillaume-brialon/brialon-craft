// Diagramme « Calendar facts » de xkcd (https://xkcd.com/1930/, CC BY-NC 2.5) :
// une suite (seq) enchaîne ses éléments, une alternative (alt) en tire un au hasard
export type FactNode = string | { seq: FactNode[] } | { alt: FactNode[] }

export const FACTS: FactNode = {
  seq: [
    'Did you know that',
    {
      alt: [
        {
          seq: [
            'the',
            {
              alt: [
                'fall',
                'spring'
              ]
            },
            'equinox'
          ]
        },
        {
          seq: [
            'the',
            {
              alt: [
                'winter',
                'summer'
              ]
            },
            {
              alt: [
                'solstice',
                'Olympics'
              ]
            }
          ]
        },
        {
          seq: [
            'the',
            {
              alt: [
                'earliest',
                'latest'
              ]
            },
            {
              alt: [
                'sunrise',
                'sunset'
              ]
            }
          ]
        },
        {
          seq: [
            'daylight',
            {
              alt: [
                'saving',
                'savings'
              ]
            },
            'time'
          ]
        },
        {
          seq: [
            'leap',
            {
              alt: [
                'day',
                'year'
              ]
            }
          ]
        },
        'Easter',
        {
          seq: [
            'the',
            {
              alt: [
                'harvest',
                'super',
                'blood'
              ]
            },
            'moon'
          ]
        },
        'Toyota truck month',
        'Shark Week'
      ]
    },
    {
      alt: [
        {
          seq: [
            'happens',
            {
              alt: [
                'earlier',
                'later',
                'at the wrong time'
              ]
            },
            'every year'
          ]
        },
        {
          seq: [
            'drifts out of sync with the',
            {
              alt: [
                'sun',
                'moon',
                'zodiac',
                {
                  seq: [
                    {
                      alt: [
                        'Gregorian',
                        'Mayan',
                        'lunar',
                        'iPhone'
                      ]
                    },
                    'calendar'
                  ]
                },
                'atomic clock in Colorado'
              ]
            }
          ]
        },
        {
          seq: [
            'might',
            {
              alt: [
                'not happen',
                'happen twice'
              ]
            },
            'this year'
          ]
        }
      ]
    },
    'because of',
    {
      alt: [
        {
          seq: [
            'time zone legislation in',
            {
              alt: [
                'Indiana',
                'Arizona',
                'Russia'
              ]
            }
          ]
        },
        'a decree by the Pope in the 1500s',
        {
          seq: [
            {
              alt: [
                'precession',
                'libration',
                'nutation',
                'libation',
                'eccentricity',
                'obliquity'
              ]
            },
            'of the',
            {
              alt: [
                'Moon',
                'Sun',
                'Earth\'s axis',
                'Equator',
                'prime meridian',
                'International Date Line',
                'Mason-Dixon line'
              ]
            }
          ]
        },
        'magnetic field reversal',
        {
          seq: [
            'an arbitrary decision by',
            {
              alt: [
                'Benjamin Franklin',
                'Isaac Newton',
                'FDR'
              ]
            }
          ]
        }
      ]
    },
    '?',
    'Apparently',
    {
      alt: [
        'it causes a predictable increase in car accidents.',
        'that\'s why we have leap seconds.',
        'scientists are really worried.',
        {
          seq: [
            'it was even more extreme during the',
            {
              alt: [
                'Bronze Age.',
                'ice age.',
                'Cretaceous.',
                '1990\'s.'
              ]
            }
          ]
        },
        {
          seq: [
            'there\'s a proposal to fix it, but it',
            {
              alt: [
                'will never happen.',
                'actually makes things worse.',
                'is stalled in Congress.',
                'might be unconstitutional.'
              ]
            }
          ]
        },
        'it\'s getting worse and no one knows why.'
      ]
    }
  ]
}
