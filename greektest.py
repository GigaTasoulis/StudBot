import spacy
nlp = spacy.load("el_core_news_lg")
text = '''Πότε έφυγες έτσι απροσδόκητα; Δεν περιμένα να μην σε δώ όταν γυρίσω.'''
doc = nlp(text)
for token in doc:
    print(token)