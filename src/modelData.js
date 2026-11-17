export const MODEL = {
  "indicators": [
    {
      "id": 1,
      "name": "Понятность интерфейса"
    },
    {
      "id": 2,
      "name": "Логичность структуры"
    },
    {
      "id": 3,
      "name": "Понятность терминологии"
    },
    {
      "id": 4,
      "name": "Информативность обратной связи"
    },
    {
      "id": 5,
      "name": "Визуальная различимость элементов"
    },
    {
      "id": 6,
      "name": "Понятность навигации"
    },
    {
      "id": 7,
      "name": "Понятность ошибок"
    },
    {
      "id": 8,
      "name": "Эффективность взаимодействия"
    },
    {
      "id": 9,
      "name": "Простота выполнения операций"
    },
    {
      "id": 10,
      "name": "Комфортность взаимодействия"
    },
    {
      "id": 11,
      "name": "Предсказуемость поведения"
    },
    {
      "id": 12,
      "name": "Доступность функций"
    },
    {
      "id": 13,
      "name": "Адаптивность интерфейса"
    },
    {
      "id": 14,
      "name": "Восстанавливаемость после ошибочных действий"
    },
    {
      "id": 15,
      "name": "Простота первоначального освоения"
    },
    {
      "id": 16,
      "name": "Доступность обучающих материалов"
    },
    {
      "id": 17,
      "name": "Последовательность освоения функций"
    },
    {
      "id": 18,
      "name": "Закрепление навыков"
    },
    {
      "id": 19,
      "name": "Простота освоения новых функций"
    },
    {
      "id": 20,
      "name": "Самостоятельность пользователя"
    },
    {
      "id": 21,
      "name": "Эстетичность интерфейса"
    },
    {
      "id": 22,
      "name": "Визуальная согласованность"
    },
    {
      "id": 23,
      "name": "Эмоциональное восприятие"
    },
    {
      "id": 24,
      "name": "Заинтересованность пользователя"
    },
    {
      "id": 25,
      "name": "Субъективная привлекательность"
    },
    {
      "id": 26,
      "name": "Удовлетворённость взаимодействием"
    },
    {
      "id": 27,
      "name": "Желание повторного использования"
    }
  ],
  "groups": [
    {
      "id": "X1",
      "name": "Понятность",
      "start": 1,
      "end": 7
    },
    {
      "id": "X2",
      "name": "Удобство использования",
      "start": 8,
      "end": 14
    },
    {
      "id": "X3",
      "name": "Изучаемость",
      "start": 15,
      "end": 20
    },
    {
      "id": "X4",
      "name": "Привлекательность",
      "start": 21,
      "end": 27
    }
  ],
  "disturbances": [
    {
      "id": 1,
      "name": "Доля пользователей с недостаточным уровнем подготовки, %"
    },
    {
      "id": 2,
      "name": "Доля конфигураций, не соответствующих оптимальным условиям, %"
    },
    {
      "id": 3,
      "name": "Средняя сетевая задержка, мс"
    },
    {
      "id": 4,
      "name": "Среднее количество операций в пользовательском сценарии, шт."
    },
    {
      "id": 5,
      "name": "Доля сценариев, затронутых изменением регламентов, %"
    }
  ],
  "equations": [
    {
      "x": 1,
      "functions": [
        1,
        2,
        3
      ],
      "component": "X1",
      "neighbors": [
        1,
        2
      ],
      "disturbances": [
        {
          "z": 1,
          "sign": 1
        }
      ]
    },
    {
      "x": 2,
      "functions": [
        4,
        5,
        6
      ],
      "component": "X1",
      "neighbors": [
        1,
        3
      ],
      "disturbances": [
        {
          "z": 1,
          "sign": 1
        }
      ]
    },
    {
      "x": 3,
      "functions": [
        7,
        8,
        9
      ],
      "component": "X1",
      "neighbors": [
        2,
        4
      ],
      "disturbances": [
        {
          "z": 1,
          "sign": 1
        }
      ]
    },
    {
      "x": 4,
      "functions": [
        10,
        11,
        12
      ],
      "component": "X1",
      "neighbors": [
        3,
        5
      ],
      "disturbances": []
    },
    {
      "x": 5,
      "functions": [
        13,
        14,
        15
      ],
      "component": "X1",
      "neighbors": [
        4,
        6
      ],
      "disturbances": [
        {
          "z": 2,
          "sign": 1
        }
      ]
    },
    {
      "x": 6,
      "functions": [
        16,
        17,
        18
      ],
      "component": "X1",
      "neighbors": [
        5,
        7
      ],
      "disturbances": [
        {
          "z": 4,
          "sign": 1
        },
        {
          "z": 5,
          "sign": -1
        }
      ]
    },
    {
      "x": 7,
      "functions": [
        19,
        20,
        21
      ],
      "component": "X1",
      "neighbors": [
        6,
        8
      ],
      "disturbances": []
    },
    {
      "x": 8,
      "functions": [
        22,
        23,
        24
      ],
      "component": "X2",
      "neighbors": [
        7,
        9
      ],
      "disturbances": [
        {
          "z": 3,
          "sign": 1
        },
        {
          "z": 4,
          "sign": -1
        }
      ]
    },
    {
      "x": 9,
      "functions": [
        25,
        26,
        27
      ],
      "component": "X2",
      "neighbors": [
        8,
        10
      ],
      "disturbances": [
        {
          "z": 4,
          "sign": 1
        },
        {
          "z": 5,
          "sign": -1
        }
      ]
    },
    {
      "x": 10,
      "functions": [
        28,
        29,
        30
      ],
      "component": "X2",
      "neighbors": [
        9,
        11
      ],
      "disturbances": [
        {
          "z": 3,
          "sign": 1
        },
        {
          "z": 4,
          "sign": -1
        }
      ]
    },
    {
      "x": 11,
      "functions": [
        31,
        32,
        33
      ],
      "component": "X2",
      "neighbors": [
        10,
        12
      ],
      "disturbances": [
        {
          "z": 3,
          "sign": 1
        }
      ]
    },
    {
      "x": 12,
      "functions": [
        34,
        35,
        36
      ],
      "component": "X2",
      "neighbors": [
        11,
        13
      ],
      "disturbances": [
        {
          "z": 2,
          "sign": 1
        }
      ]
    },
    {
      "x": 13,
      "functions": [
        37,
        38,
        39
      ],
      "component": "X2",
      "neighbors": [
        12,
        14
      ],
      "disturbances": [
        {
          "z": 2,
          "sign": 1
        }
      ]
    },
    {
      "x": 14,
      "functions": [
        40,
        41,
        42
      ],
      "component": "X2",
      "neighbors": [
        13,
        15
      ],
      "disturbances": [
        {
          "z": 2,
          "sign": 1
        },
        {
          "z": 3,
          "sign": -1
        }
      ]
    },
    {
      "x": 15,
      "functions": [
        43,
        44,
        45
      ],
      "component": "X3",
      "neighbors": [
        14,
        16
      ],
      "disturbances": [
        {
          "z": 1,
          "sign": 1
        },
        {
          "z": 4,
          "sign": -1
        }
      ]
    },
    {
      "x": 16,
      "functions": [
        46,
        47,
        48
      ],
      "component": "X3",
      "neighbors": [
        15,
        17
      ],
      "disturbances": [
        {
          "z": 1,
          "sign": 1
        }
      ]
    },
    {
      "x": 17,
      "functions": [
        49,
        50,
        51
      ],
      "component": "X3",
      "neighbors": [
        16,
        18
      ],
      "disturbances": [
        {
          "z": 5,
          "sign": 1
        }
      ]
    },
    {
      "x": 18,
      "functions": [
        52,
        53,
        54
      ],
      "component": "X3",
      "neighbors": [
        17,
        19
      ],
      "disturbances": [
        {
          "z": 1,
          "sign": 1
        }
      ]
    },
    {
      "x": 19,
      "functions": [
        55,
        56,
        57
      ],
      "component": "X3",
      "neighbors": [
        18,
        20
      ],
      "disturbances": [
        {
          "z": 4,
          "sign": 1
        },
        {
          "z": 5,
          "sign": -1
        }
      ]
    },
    {
      "x": 20,
      "functions": [
        58,
        59,
        60
      ],
      "component": "X3",
      "neighbors": [
        19,
        21
      ],
      "disturbances": [
        {
          "z": 1,
          "sign": 1
        },
        {
          "z": 5,
          "sign": -1
        }
      ]
    },
    {
      "x": 21,
      "functions": [
        61,
        62,
        63
      ],
      "component": "X4",
      "neighbors": [
        20,
        22
      ],
      "disturbances": [
        {
          "z": 2,
          "sign": 1
        }
      ]
    },
    {
      "x": 22,
      "functions": [
        64,
        65,
        66
      ],
      "component": "X4",
      "neighbors": [
        21,
        23
      ],
      "disturbances": []
    },
    {
      "x": 23,
      "functions": [
        67,
        68,
        69
      ],
      "component": "X4",
      "neighbors": [
        22,
        24
      ],
      "disturbances": [
        {
          "z": 3,
          "sign": 1
        }
      ]
    },
    {
      "x": 24,
      "functions": [
        70,
        71,
        72
      ],
      "component": "X4",
      "neighbors": [
        23,
        25
      ],
      "disturbances": [
        {
          "z": 5,
          "sign": 1
        }
      ]
    },
    {
      "x": 25,
      "functions": [
        73,
        74,
        75
      ],
      "component": "X4",
      "neighbors": [
        24,
        26
      ],
      "disturbances": []
    },
    {
      "x": 26,
      "functions": [
        76,
        77,
        78
      ],
      "component": "X4",
      "neighbors": [
        25,
        27
      ],
      "disturbances": [
        {
          "z": 3,
          "sign": 1
        }
      ]
    },
    {
      "x": 27,
      "functions": [
        79,
        80,
        81
      ],
      "component": "X4",
      "neighbors": [
        26,
        27
      ],
      "disturbances": [
        {
          "z": 5,
          "sign": 1
        }
      ]
    }
  ]
};
